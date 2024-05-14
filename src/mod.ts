import * as vite from "vite";
import * as tools from "./tools";
import * as fs from "node:fs/promises";
import * as p from "path";
import { handleNodeResponse, createRequest } from "./node-polyfills"
import { existsSync } from "node:fs";
import NodeAdaptor from "./adaptors/node";

/***********************************************************
    Vono Config
 ************************************************************/

export type Vono = {
	serverEntry: string;
	clientEntry?: string;
	adaptor: Adaptor;
	includeIndexHtml?: boolean;
}

export const createConfig = (config: Partial<Vono> = {}): Vono => {
	return {
		serverEntry: config.serverEntry || "src/server.entry",
		clientEntry: config.clientEntry || "index.html",
		adaptor: config.adaptor || new NodeAdaptor(),
		includeIndexHtml: config.includeIndexHtml ?? false,
	};
};

/***********************************************************
    Adaptor
 ************************************************************/

export abstract class Adaptor {
	abstract name: string;
	// RUNTIME ---------------------------------------------------------------------
	abstract productionRuntime: string;
	abstract developmentRuntime: string;
	// OUTPUT ----------------------------------------------------------------
	outputDirectory = "dist";
	entryName = "server";
	inlineDynamicImports = false;
	// ENV ---------------------------------------------------------------------
	alias: { [p: string]: string } = {};
	inject: { [p: string]: string | string[] } = {};
	polyfill: string[] = [];
	external: string[] = [];
	resolve: {
		conditions?: string[] | undefined;
		externalConditions?: string[] | undefined;
	} = {};
	// ACTIONS ----------------------------------------------------------------
	buildStart?: () => void | Promise<void>;
	buildEnd?: () => void | Promise<void>;
	buildError?: (err: Error) => void | Promise<void>;
	prerender?: () => void | Promise<void>;
}

/***********************************************************
    Get request via global
 ************************************************************/

export function getRequest(): Request | null {
	try {
		const request = globalThis.getRequest_unsafe?.();
		return request ?? null;
	} catch {
		return null;
	}
}

/***********************************************************
    Clear Outdir Plugin
 ************************************************************/

function clearOutdir(outDir: string): vite.Plugin {
	let viteConfig: vite.ResolvedConfig;
	return {
		name: 'vono:clear-outdir',
		configResolved: async (vite) => {
			viteConfig = vite;
		},
		buildStart: async () => {
			if (viteConfig.build.ssr) return;
			try {
				await fs.rm(outDir, {recursive: true});
			} catch {
			}
		}
	}

}

/***********************************************************
	VFS Plugin
 ************************************************************/

export class VFS {
	store = new Map<string, VFile>();

	constructor(
		options: {
			store?: Map<string, VFile>;
		} = {},
	) {
		if (options.store) this.store = options.store;
	}

	add<
		C extends ContentFn | undefined,
		SC extends ContentFn | undefined,
		CC extends ContentFn | undefined,
	>(vfile: {
		path: string;
		content?: C;
		serverContent?: SC;
		clientContent?: CC;
	}) {
		let path = vfile.path.startsWith("/") ? vfile.path : "/" + vfile.path;
		vfile.path = path;
		this.store.set(path, vfile);
		return vfile as {
			path: string;
			content: C;
			serverContent: SC;
			clientContent: CC;
		} satisfies VFile;
	}

	remove(path: string) {
		!path.startsWith("/") && (path = "/" + path);
		this.store.delete(path);
	}

	get(path: string) {
		!path.startsWith("/") && (path = "/" + path);
		return this.store.get(path);
	}

	has(path: string) {
		!path.startsWith("/") && (path = "/" + path);
		return this.store.has(path);
	}
}

type ContentFn = (params: Record<string, string[]>) => string | Promise<string>;

export type VFile = {
	path: string;
	content?: ContentFn;
	serverContent?: ContentFn;
	clientContent?: ContentFn;
	write?: boolean;
};

// Global VFS instance;
const vfs = new VFS();
export const useVFS = () => vfs;

export function vfsPlugin(
	options: { vfs?: VFS; alias?: string } = {},
): vite.Plugin {
	const vfsAlias = options.alias ?? "#vfs";
	const virtualModuleId = "virtual:vfs:";
	const vfs = options.vfs ?? new VFS();
	return {
		name: "vono:vfs",
		enforce: "pre",
		config: () => {
			return {
				resolve: {
					alias: {
						[vfsAlias]: virtualModuleId,
					},
				},
			};
		},
		resolveId(id) {
			if (id.startsWith(virtualModuleId)) {
				return "\0" + id;
			}
		},
		async load(id, ctx) {
			if (id.startsWith("\0" + virtualModuleId)) {
				let path = id.replace("\0" + virtualModuleId, "");
				const url = new URL(path, "http://localhost");
				const params: Record<string, string[]> = {};
				for (const [key, value] of url.searchParams.entries()) {
					params[key] = value.split(",");
				}
				path = url.pathname;
				const file = vfs.get(path);
				if (!file) return null;
				const stringOrFn = ctx?.ssr ? file.serverContent : file.clientContent;
				const content = await (stringOrFn ?? file.content)?.(params);
				return content;
			}
		},
		handleHotUpdate(ctx) {
			// invalidate all files in the virtual module
			// todo: only invalidate the changed file
			for (const path of vfs.store.keys()) {
				const mod = ctx.server.moduleGraph.getModuleById(
					"\0" + virtualModuleId + path,
				);
				mod && ctx.server.reloadModule(mod);
			}
		},
	};
}

/***********************************************************
    HTTP Plugin
 ************************************************************/

function isHttpProtocol(id: string | undefined | null) {
	return id?.startsWith("http://") || id?.startsWith("https://");
}

const httpCache = new Map();

export function httpPlugin(): vite.Plugin {
	return {
		name: "vono:http",
		enforce: "pre",
		async resolveId(id, importer) {
			if (importer && isHttpProtocol(importer)) {
				if (id.startsWith("https://")) {
					return id;
				}
				const {pathname, protocol, host} = new URL(importer);
				// for skypack
				if (id.startsWith("/")) {
					return `${protocol}//${host}${id}`;
				} else if (id.startsWith(".")) {
					const resolvedPathname = p.join(p.dirname(pathname), id);
					const newId = `${protocol}//${host}${resolvedPathname}`;
					return newId;
				}
			} else if (isHttpProtocol(id)) {
				return id;
			}
		},
		async load(id) {
			if (id === null) {
				return;
			}
			if (isHttpProtocol(id)) {
				const cached = httpCache.get(id);
				if (cached) {
					return cached;
				}
				const res = await fetch(id);
				if (!res.ok) {
					throw res.statusText;
				}
				const code = await res.text();
				httpCache.set(id, code);
				return code;
			}
		},
	};
}

/***********************************************************
    Manifest Plugin
 ************************************************************/

function createDevManifest(
	rollupOptions: vite.BuildOptions["rollupOptions"],
): vite.Manifest {
	const entries = rollupOptions?.input ?? {};
	if (Array.isArray(entries)) {
		return entries.reduce((manifest, entry) => {
			manifest[entry] = {
				file: entry,
				isEntry: true,
				src: entry,
			};
			return manifest;
		}, {} as vite.Manifest);
	}
	if (typeof entries === "object") {
		return Object.entries(entries).reduce((manifest, [, entry]) => {
			manifest[entry] = {
				file: entry,
				isEntry: true,
				src: entry,
			};
			return manifest;
		}, {} as vite.Manifest);
	}
	if (typeof entries === "string") {
		return {
			[entries]: {
				file: entries,
				isEntry: true,
				src: entries,
			},
		};
	}
	return {};
}

async function getBuildManifest(path: string) {
	const manifestRaw = await fs.readFile(path, "utf-8");
	const manifest = JSON.parse(manifestRaw);
	if (!manifest) {
		throw new Error("Build manifest not found at " + path);
	}
	return manifest;
}

interface ManifestChunk {
	src?: string;
	file: string;
	css?: string[];
	assets?: string[];
	isEntry?: boolean;
	name?: string;
	isDynamicEntry?: boolean;
	imports?: string[];
	dynamicImports?: string[];
}

function stripLeadingSlash(str: string) {
	return str.replace(/^\//, "");
}

export function moduleNodeToManifestChunk(node: vite.ModuleNode): ManifestChunk {
	if (!node) {
		return {
			file: "",
		};
	}
	return {
		src: stripLeadingSlash(node.url),
		file: stripLeadingSlash(node.url),
		// @ts-ignore
		css: [...node.staticImportedUrls]
			.filter((url) => url.endsWith(".css"))
			.map(stripLeadingSlash),
		// @ts-ignore
		assets: [...node.staticImportedUrls]
			.filter((url) => !url.endsWith(".css"))
			.map(stripLeadingSlash),
	};
}

function manifest(config: {
	manifest: string | (() => string);
}): vite.Plugin {
	const vfs = useVFS();
	let server: vite.ViteDevServer;
	return {
		name: "vono:manifest",
		enforce: "pre",
		configResolved: async (vite) => {
			const isBuild = vite.mode === "production";

			vfs.add({
				path: "/manifest",
				serverContent: async () => {
					if (isBuild) {
						const path =
							typeof config.manifest === "function"
								? config.manifest()
								: config.manifest;
						return `export default ${JSON.stringify(
							await getBuildManifest(p.join(vite.build.outDir, path)),
						)};`;
					} else {
						return `export default ${JSON.stringify(
							createDevManifest(vite.build.rollupOptions),
						)};`;
					}
				},
			});
		},

		configureServer(_server) {
			server = _server;

			server.middlewares.use(async (req, res, next) => {
				if (!req.originalUrl?.startsWith("/__fetch_asset")) {
					next();
					return;
				}

				const url = new URL(req.originalUrl, "http://localhost");
				let mod = url.searchParams.get("mod");
				if (mod?.startsWith("/")) {
					mod = mod.slice(1);
				}

				if (!mod) {
					res.writeHead(400);
					res.end("mod query param is required");
					return;
				}

				const scripts: string[] = [];
				if (mod.endsWith("index.html")) {
					const parser = (await import("node-html-parser")).parse;
					const html = await fs.readFile(
						p.join(server.config.root, mod),
						"utf-8",
					);
					await server.transformIndexHtml("/", html);
					const root = parser(html);
					for (const script of root.querySelectorAll("script")) {
						const src = script.getAttribute("src");
						if (src) {
							await server.warmupRequest(src);
							scripts.push(src);
						}
					}
				} else {
					await server.warmupRequest(mod);
					scripts.push(mod);
				}

				const chunks: ManifestChunk[] = [];
				for (const script of scripts) {
					const modNode = await server.moduleGraph.getModuleByUrl(script);
					if (!modNode) {
						continue;
					}
					chunks.push(moduleNodeToManifestChunk(modNode));
				}

				const result: ManifestChunk = {
					name: stripLeadingSlash(mod),
					file: stripLeadingSlash(mod),
					src: stripLeadingSlash(mod),
					css: chunks?.flatMap((chunk) => chunk.css ?? [])?.filter(Boolean),
					assets: chunks
						?.flatMap((chunk) => chunk.assets ?? [])
						?.filter(Boolean),
				};

				res.writeHead(200, {"content-type": "application/json"});
				// @ts-ignore
				res.write(JSON.stringify(result));
				res.end();
			});
		},
	};
}

/***********************************************************
    Shell Plugin
 ************************************************************/

function shell(): vite.Plugin {
	const vfs = useVFS();
	let server: vite.ViteDevServer | undefined;
	return {
		name: "vono:shell",
		enforce: "pre",
		configResolved: async (vite) => {
			const isBuild = vite.mode === "production";
			const dist = vite.build?.outDir || "dist";
			vfs.add({
				path: "/shell",
				serverContent: async () => {
					let content = null;
					if (isBuild) {
						try {
							content = JSON.stringify(
								await fs.readFile(p.join(dist, "client", "index.html"), "utf-8"),
							);
						} catch {
							throw new Error(
								"Attempted to import non-existent shell html file.",
							);
						}
						return `export default ${content};`;
					} else {
						try {
							content = await server!.transformIndexHtml(
								"/",
								await fs.readFile(p.join(vite.root, "index.html"), "utf-8"),
							);
						} catch (e) {
							console.warn("Attempted to import non-existent shell html file.");
						}
						return `export default ${JSON.stringify(content)};`;
					}
				},
			});
		},
		configureServer: (_server) => {
			server = _server;
		},
	};
}

/***********************************************************
    Endpoint Plugin
************************************************************/

export type EndpointConfig = {
	endpoint: string
}

export function endpoints(config: Partial<EndpointConfig> = {}): vite.Plugin {
	const vfs = useVFS()
	let vite: vite.ResolvedConfig | null = null
	let manifest = {}

	const generateManifest = (config: vite.ResolvedConfig) => ({})

	return {
		name: "endpoints",
		configResolved: (config) => {
			// need to generate manifest here
			vfs.add({
				path: '/endpoints/manifest',
				serverContent: () => `export default ${JSON.stringify(manifest)}`
			})
		},
		transform(code, id, c) {
			if(c?.ssr) {
				return code
			}
			// transform to client runtime code
		},
		handleHotUpdate: (ctx) => {
			// handle updating manifest here...
		}
	}
}

/***********************************************************
	Vono Plugin
 ************************************************************/

export default function vono(config: Partial<Vono> = {}): vite.Plugin[] {
	let devHandler: any;
	let updateHandler: any;
	const vono = createConfig(config);
	let viteConfig: vite.ResolvedConfig;

	return [
		httpPlugin(),
		manifest({manifest: "client/.vite/manifest.json"}),
		shell(),
		vfsPlugin({vfs: useVFS(), alias: "#vono"}),
		clearOutdir(vono.adaptor.outputDirectory),
		{
			name: "vono:main",
			enforce: "pre",
			config: (vite) => {
				const ssr = <T, U>(ssr: T, client?: U): U | T | undefined =>
					vite.build?.ssr ? ssr : client;
				const root = vite.root || process.cwd();

				return {
					appType: "custom",
					resolve: {
						alias: ssr(vono.adaptor.alias),
					},
					ssr: ssr({
						noExternal: true,
						external: vono.adaptor.external,
					}),
					build: {
						emptyOutDir: false,
						outDir: ssr(
							p.join(root, vono.adaptor.outputDirectory),
							p.join(root, vono.adaptor.outputDirectory, "client"),
						),
						manifest: ssr(false, true),
						ssrEmitAssets: false,
						ssr: ssr(true, false),
						inlineDynamicImports: ssr(vono.adaptor.inlineDynamicImports),
						rollupOptions: ssr(
							{
								input: {
									[vono.adaptor.entryName]: vono.adaptor.productionRuntime,
								},
								output: {
									inlineDynamicImports: vono.adaptor.inlineDynamicImports,
									chunkFileNames: "server/[name]-[hash].js",
								},
								external: vono.adaptor.external,
							},
							{
								input: [tools.resolveUnknownExtension(vono.clientEntry), existsSync(p.join(root, 'index.html')) && "/index.html"].filter(
									String,
								) as string[],
								output: {
									assetFileNames: "__immutables/[name]-[hash].[ext]",
									chunkFileNames: "__immutables/[name]-[hash].js",
									entryFileNames: "__immutables/[name]-[hash].js",
								}
							},
						),
					},
				};
			},
			configResolved: async (vite) => {
				viteConfig = vite;

				useVFS().add({
					path: "entry",
					serverContent: () =>
						`export {default} from '${tools.slash(
							p.join(viteConfig.root, vono.serverEntry),
						)}';`,
				});

				let buildctx: any;
				if (viteConfig.build?.ssr) {
					buildctx = {
						...(await fs
							.readFile(
								p.join(vono.adaptor.outputDirectory, "vono.json"),
								"utf-8",
							)
							.then((content) => JSON.parse(content))),
					};
				} else {
					// not needed at the moment
					buildctx = {};
				}

				useVFS().add({
					path: "buildctx",
					serverContent: () =>
						`export default ${JSON.stringify(buildctx, null, 2)}`,
				});

				useVFS().add({
					path: "assets",
					serverContent: () =>
						`export async function getModuleInfo (path){ path.startsWith("/") && (path = path.slice(1)); if (import.meta.env.DEV) { const res = await fetch(\`http://localhost:5173/__fetch_asset?mod=\${path}\`); if (!res.ok) {throw new Error("Failed to fetch assets")}; return await res.json();}; const manifest = (await import("#vono/manifest")).default; return manifest[path]}`,
				});

				useVFS().add({
					path: "/request",
					serverContent: () =>
						`export default () => globalThis.getRequest_unsafe?.() ?? null;`,
					clientContent: () => `export default () => null`,
				});
			},
			configureServer: (server) => {
				return async () => {
					if (!tools.resolveUnknownExtension(p.join(viteConfig.root, vono.serverEntry))) {
						throw new Error(
							`Could not find server entry @ ${vono.serverEntry}. Please provide a path to a file that exports a default handler function with the signature: (request: Request) => Response | Promise<Response>`,
						);
					}
					updateHandler = async () => {
						devHandler = (
							await server.ssrLoadModule(vono.adaptor.developmentRuntime)
						).default;
					};
					await updateHandler();
					server.middlewares.use(async (nodeRequest, nodeResponse, next) => {
						try {
							const request = createRequest(nodeRequest);
							const response = await devHandler(request);
							return handleNodeResponse(response, nodeResponse);
						} catch (e) {
							console.error(e);
							next();
						}
					});
				};
			},
			configurePreviewServer: () => {
				throw new Error(
					"Preview server is not supported in Vono. Please replace this command with `node dist/server` if using the default Node adaptor.",
				);
			},
			handleHotUpdate: async (ctx) => {
				const containsEntry = (mod: vite.ModuleNode): boolean => {
					if (!mod.id) return false;
					if (
						tools.stripExt(mod.id) === tools.slash(p.join(viteConfig.root, vono.serverEntry))
					) {
						return true;
					}
					// @ts-ignore
					for (const dep of mod.importers) {
						if (containsEntry(dep)) return true;
					}
					return false;
				};
				if (ctx.modules.some(containsEntry)) {
					await updateHandler();
					ctx.server.hot.send({type: "full-reload"});
				}
			},
			writeBundle: {
				sequential: true,
				order: "post",
				handler: async () => {
					if (!viteConfig.build?.ssr) {
						// clear the directory
						await fs.writeFile(
							p.join(vono.adaptor.outputDirectory, "vono.json"),
							JSON.stringify({
								clientOutputDirectory: viteConfig.build?.outDir,
							}),
						);
						const {spawn} = await import("child_process");
						await vono.adaptor.buildStart?.();
						const child = spawn("vite", ["build", "--ssr"], {shell: true});
						let complete: () => void;
						const promise = new Promise<void>((resolve) => {
							complete = resolve;
						});
						child.on("disconnect", () => {
							complete?.();
						});
						child.on("exit", () => {
							complete?.();
						});
						child.on("error", async (err) => {
							await vono.adaptor.buildError?.(err);
							throw new Error(`Failed to build server: ${err}`);
						});
						child.stderr.pipe(process.stdout);
						child.stdout.pipe(process.stdout);
						await promise;
						// server cleanup
						try {
							await fs.rm(p.join(viteConfig.build.outDir, '.vite'), {recursive: true});
						} catch (e) {
							console.log(e)
						}
						if (!vono.includeIndexHtml) {
							try {
								await fs.rm(p.join(viteConfig.build.outDir, "index.html"));
							} catch {
							}
						}
						await vono.adaptor.prerender?.();
						await vono.adaptor.buildEnd?.();
						return;
					}
				},
			},
		},
	];
}
