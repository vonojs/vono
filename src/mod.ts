import { ModuleNode, type Plugin, ResolvedConfig } from "vite";
import vfsPlugin from "./plugins/vfs";
import { useVFS } from "./vfs";
import { httpPlugin } from "./plugins/http";
import { createRequest, handleNodeResponse } from "./tools/req-res";
import { join } from "node:path";
import { resolveExt, slash, stripExt } from "./tools/resolve";
import manifest from "./plugins/manifest";
import shell from "./plugins/shell";
import * as fs from "fs/promises";
import NodeAdaptor from "./adaptors/node";
import {existsSync} from "fs";
import { Adaptor } from "./adaptor";

export type Vono = {
	serverEntry: string;
	clientEntry?: string;
	adaptor: Adaptor;
	includeIndexHtml?: boolean;
};

export const createConfig = (config: Partial<Vono> = {}): Vono => {
	return {
		serverEntry: config.serverEntry || "src/server.entry",
		clientEntry: config.clientEntry || "index.html",
		adaptor: config.adaptor || new NodeAdaptor(),
		includeIndexHtml: config.includeIndexHtml ?? false,
	};
};

declare global {
	var getRequest_unsafe: (() => Request | undefined) | undefined;
}

export { useVFS } from "./vfs";

export function getRequest(): Request | null {
	try {
		const request = globalThis.getRequest_unsafe?.();
		return request ?? null;
	} catch {
		return null;
	}
}

const clearOutdir = (outDir: string): Plugin => {
	let viteConfig: ResolvedConfig;
	return {
		name: 'vono:clear-outdir',
		configResolved: async (vite) => {
			viteConfig = vite;
		},
		buildStart: async (vite) => {
			if(viteConfig.build.ssr) return;
			try {
				await fs.rm(outDir, { recursive: true });
			} catch {}
		}
	}

}

export default function vono(config: Partial<Vono> = {}): Plugin[] {
	let devHandler: any;
	let updateHandler: any;
	const vono = createConfig(config);
	let viteConfig: ResolvedConfig;

	return [
		httpPlugin(),
		manifest({ manifest: "client/.vite/manifest.json" }),
		shell(),
		vfsPlugin({ vfs: useVFS(), alias: "#vono" }),
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
							join(root, vono.adaptor.outputDirectory),
							join(root, vono.adaptor.outputDirectory, "client"),
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
								input: [resolveExt(vono.clientEntry), existsSync(join(root, 'index.html')) && "/index.html"].filter(
									Boolean,
								),
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
						`export {default} from '${slash(
							join(viteConfig.root, vono.serverEntry),
						)}';`,
				});

				let buildctx: any;
				if (viteConfig.build?.ssr) {
					buildctx = {
						...(await fs
							.readFile(
								join(vono.adaptor.outputDirectory, "vono.json"),
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
					if (!resolveExt(join(viteConfig.root, vono.serverEntry))) {
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
							const request = createRequest(nodeRequest, nodeResponse);
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
				const containsEntry = (mod: ModuleNode): boolean => {
					if (!mod.id) return false;
					if (
						stripExt(mod.id) === slash(join(viteConfig.root, vono.serverEntry))
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
					ctx.server.hot.send({ type: "full-reload" });
				}
			},
			writeBundle: {
				sequential: true,
				order: "post",
				handler: async () => {
					if (!viteConfig.build?.ssr) {
						// clear the directory
						await fs.writeFile(
							join(vono.adaptor.outputDirectory, "vono.json"),
							JSON.stringify({
								clientOutputDirectory: viteConfig.build?.outDir,
							}),
						);
						const { spawn } = await import("child_process");
						await vono.adaptor.buildStart?.();
						const child = spawn("vite", ["build", "--ssr"], { shell: true });
						let complete: () => void;
						const p = new Promise<void>((resolve) => {
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
						await p;
						// server cleanup
						try {
							await fs.rm(join(viteConfig.build.outDir, '.vite'), {recursive: true});
						} catch(e) {
							console.log(e)
						}
						if (!vono.includeIndexHtml) {
							try {
								await fs.rm(join(viteConfig.build.outDir, "index.html"));
							} catch {}
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
