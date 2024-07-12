import * as vite from "vite";
import * as tools from "./tools.ts";
import * as fs from "node:fs/promises";
import * as p from "path";
import { handleNodeResponse, createRequest } from "./node-polyfills.ts";
import { Adaptor } from "./adaptors/index.ts";
import { NodeAdaptor } from "./adaptors/node/index.ts";
import { createLogger, Logger } from "@benstack/logger";

/****************************************************************************************
 * Logger
 *****************************************************************************************/

export const Log = createLogger({
	name: "VONO",
	level: Logger.LogLevels.INFO,
});

/***********************************************************
    Vono Config
 ************************************************************/

export type Vono = {
	serverEntry: string;
	clientEntry?: string;
	adaptor: Adaptor;
	exclude: RegExp[];
};

const createConfig = (config: Partial<Vono> = {}): Vono => {
	return {
		serverEntry: config.serverEntry || "src/server.entry",
		clientEntry: config.clientEntry,
		adaptor: config.adaptor || new NodeAdaptor(),
		exclude: [
			/.*\.css$/,
			/.*\.ts$/,
			/.*\.tsx$/,
			/^\/@.+$/,
			/\?t\=\d+$/,
			/^\/favicon\.ico$/,
			/^\/static\/.+/,
			/^\/node_modules\/.*/,
			...(config.exclude ?? []),
		],
	};
};

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
    Assets Plugin
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

async function createBuildManifest(path: string) {
	const manifestRaw = await fs.readFile(path, "utf-8");
	const manifest = JSON.parse(manifestRaw);
	if (!manifest) {
		throw new Error("Build assets not found at " + path);
	}
	return manifest;
}

function moduleNodeToManifestChunk(node: vite.ModuleNode): vite.ManifestChunk {
	if (!node) {
		return {
			file: "",
		};
	}
	const imports: string[] = [];
	for (const imp of node.importedModules) {
		imports.push(moduleNodeToManifestChunk(imp).file);
	}
	return {
		src: tools.stripLeadingSlash(node.url),
		file: tools.stripLeadingSlash(node.url),
		// @ts-ignore
		css: [...(node.staticImportedUrls ?? [])]
			.filter((url) => url.endsWith(".css"))
			.map(tools.stripLeadingSlash),
		imports: imports.filter((f) =>
			[".js", ".jsx", ".ts", ".tsx"].some((ext) => f.endsWith(ext)),
		),
	};
}

function assetsPlugin(): vite.Plugin {
	const vfs = useVFS();

	let server: vite.ViteDevServer;

	return {
		name: "vono:assets",
		enforce: "pre",
		configResolved: async (vite) => {
			const isBuild = vite.mode === "production";

			vfs.add({
				path: "/assets",
				serverContent: async () => {
					const asset = `export async function asset (path){ path.startsWith("/") && (path = path.slice(1)); if (import.meta.env.DEV) { const res = await fetch(\`http://localhost:5173/__fetch_asset?mod=\${path}\`); if (!res.ok) {throw new Error("Failed to fetch assets")}; return await res.json();}; const manifest = (await import("#vono/assets")).manifest; return manifest[path]};`;
					if (isBuild) {
						const path = "client/.vite/manifest.json";
						return `export const manifest = ${JSON.stringify(
							await createBuildManifest(p.join(vite.build.outDir, path)),
						)};${asset}`;
					} else {
						return `export const manifest = ${JSON.stringify(
							createDevManifest(vite.build.rollupOptions),
						)};${asset}`;
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

				await server.warmupRequest(mod);

				const modNode = await server.moduleGraph.getModuleByUrl(mod);

				if (!modNode) {
					res.writeHead(404);
					res.end("Module not found");
					return;
				}

				const result = moduleNodeToManifestChunk(modNode);

				res.writeHead(200, { "content-type": "application/json" });
				res.write(JSON.stringify(result));
				res.end();
			});
		},
	};
}

/***********************************************************
	Vono Plugin
 ************************************************************/

export default function vono(config: Partial<Vono> = {}): vite.Plugin[] {
	let devHandler: (request: Request) => Promise<Response>;

	let updateHandler: () => Promise<void>;

	const vono = createConfig(config);

	let viteConfig: vite.ResolvedConfig;

	return [
		vfsPlugin({ vfs: useVFS(), alias: "#vono" }),
		assetsPlugin(),
		{
			name: "vono",
			enforce: "pre",

			config: (vite) => {
				const root = vite.root || process.cwd();

				const baseOptions: Omit<vite.UserConfig, "plugins"> = {
					appType: "custom",
					resolve: {
						alias: vono.adaptor.alias,
					},
				};

				if (vite.build?.ssr) {
					return {
						...baseOptions,
						resolve: {
							alias: vono.adaptor.alias,
						},
						ssr: {
							noExternal: true,
							external: vono.adaptor.external,
						},
						build: {
							...baseOptions.build,
							emptyOutDir: false,
							outDir: p.join(root, vono.adaptor.outputDirectory),
							manifest: false,
							ssr: true,
							inlineDynamicImports: vono.adaptor.inlineDynamicImports,
							rollupOptions: {
								input: {
									[vono.adaptor.entryName]: vono.adaptor.productionRuntime,
								},
								output: {
									inlineDynamicImports: vono.adaptor.inlineDynamicImports,
									chunkFileNames: "server/[name]-[hash].js",
								},
								external: vono.adaptor.external,
							},
						},
					};
				}

				if (vono.clientEntry) {
					return {
						...baseOptions,
						build: {
							...baseOptions.build,
							outDir: p.join(root, vono.adaptor.outputDirectory, "client"),
							emptyOutDir: false,
							manifest: true,
							rollupOptions: {
								input: [vono.clientEntry],
								output: {
									assetFileNames: "__immutables/[name]-[hash].[ext]",
									chunkFileNames: "__immutables/[name]-[hash].js",
									entryFileNames: "__immutables/[name]-[hash].js",
								},
							},
						},
					};
				}
			},

			configResolved: async (vite) => {
				viteConfig = vite;

				if (!viteConfig.build.ssr) {
					console.log(viteConfig.build.outDir);
				}

				useVFS().add({
					path: "entry",
					serverContent: () =>
						`export {default} from '${tools.slash(
							p.join(viteConfig.root, vono.serverEntry),
						)}';`,
				});

				useVFS().add({
					path: "request",
					serverContent: () =>
						`export const getRequest = () => globalThis.getRequest_unsafe?.() ?? null;`,
					clientContent: () => `export const getRequest = () => null`,
				});
			},

			configureServer: async (server) => {
				if (
					!tools.resolveUnknownExtension(
						p.join(viteConfig.root, vono.serverEntry),
					)
				) {
					Log.warn(
						`Could not find server entry @ ${vono.serverEntry}. Please provide a path to a file that exports a default handler function with the signature: (request: Request) => Response | Promise<Response>`,
					);
					return;
				}

				updateHandler = async () => {
					devHandler = (
						await server.ssrLoadModule(vono.adaptor.developmentRuntime)
					).default;
				};

				server.middlewares.use(async (nodeRequest, nodeResponse, next) => {
					try {
						if (
							vono.exclude.some(
								(p) => nodeRequest.url && p.test(nodeRequest.url),
							)
						)
							return next();
						if (!devHandler) await updateHandler();
						const request = createRequest(nodeRequest);
						const response = await devHandler(request);
						return handleNodeResponse(response, nodeResponse);
					} catch (e) {
						Log.error(e);
						next();
					}
				});
			},

			configurePreviewServer: () => {
				throw new Error(
					"Preview server is not supported in Vono. Please replace this command with `node dist/server` if using the default Node adaptor.",
				);
			},

			handleHotUpdate: async (ctx) => {
				const containsEntry = (mod: vite.ModuleNode): boolean => {
					if (!mod.id) return false;
					if (mod.id === "\u0000virtual:vfs:/entry") return true;
					// @ts-ignore
					for (const dep of mod.importers) {
						if (containsEntry(dep)) return true;
					}
					return false;
				};
				if (ctx.modules.some(containsEntry)) {
					Log.info("reloading server module");
					await updateHandler();
					ctx.server.ws.send({ type: "full-reload" });
				} else {
					Log.info("reloading client module");
				}
			},

			writeBundle: {
				sequential: true,
				order: "post",
				handler: async () => {
					if (!viteConfig.build?.ssr) {
						const t = performance.now();
						Log.info("building server module");
						const { spawn } = await import("child_process");
						await vono.adaptor.buildStart?.();
						const child = spawn("vite", ["build", "--ssr"], { shell: true });
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
						await vono.adaptor.prerender?.();
						await vono.adaptor.buildEnd?.();
						Log.info(`server module built in ${performance.now() - t}ms`);
						return;
					}
				},
			},
		},
	];
}
