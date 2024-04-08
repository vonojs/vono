import { createConfig } from "./config.js";
import vfsPlugin from "./plugins/vfs.js";
import { useVFS } from "./vfs.js";
import { httpPlugin } from "./plugins/http.js";
import { createRequest, handleNodeResponse } from "./tools/req-res.js";
import { join } from "node:path";
import { resolveExt, slash, stripExt } from "./tools/resolve.js";
import manifest from "./plugins/manifest.js";
import shell from "./plugins/shell.js";
import * as fs from "fs/promises";
export default function vono(config = {}) {
	let devHandler;
	let updateHandler;
	const vono2 = createConfig(config);
	let viteConfig;
	return [
		httpPlugin(),
		manifest({ manifest: "client/.vite/manifest.json" }),
		shell(),
		vfsPlugin({ vfs: useVFS(), alias: "#vono" }),
		{
			name: "vono:main",
			enforce: "pre",
			config: (vite) => {
				const ssr = (content) => (vite.build?.ssr ? content : void 0);
				const root = vite.root || process.cwd();
				return {
					appType: "custom",
					resolve: {
						alias: ssr(vono2.adaptor.alias),
					},
					ssr: ssr({
						noExternal: true,
						external: vono2.adaptor.external,
					}),
					build: {
						emptyOutDir: !ssr,
						outDir: ssr(true)
							? join(root, vono2.adaptor.outputDirectory)
							: join(root, vono2.adaptor.outputDirectory, "client"),
						manifest: !ssr(true),
						ssrEmitAssets: false,
						ssr: ssr(true),
						rollupOptions: ssr({
							input: {
								server: vono2.adaptor.productionRuntime,
							},
							output: {
								inlineDynamicImports: vono2.adaptor.inlineDynamicImports,
							},
							external: vono2.adaptor.external,
						}),
					},
				};
			},
			configResolved: async (vite) => {
				viteConfig = vite;
				useVFS().add({
					path: "entry",
					serverContent: () =>
						`export {default} from "${slash(
							join(viteConfig.root, vono2.serverEntry),
						)}";`,
				});
				let buildctx;
				if (viteConfig.build?.ssr) {
					buildctx = {
						...(await fs
							.readFile(
								join(vono2.adaptor.outputDirectory, "vono.json"),
								"utf-8",
							)
							.then((content) => JSON.parse(content))),
					};
				} else {
					buildctx = {};
				}
				useVFS().add({
					path: "buildctx",
					serverContent: () =>
						`export default ${JSON.stringify(buildctx, null, 2)}`,
				});
			},
			configureServer: (server) => {
				return async () => {
					if (!resolveExt(join(viteConfig.root, vono2.serverEntry))) {
						throw new Error(
							`Could not find server entry @ ${vono2.serverEntry}. Please provide a path to a file that exports a default handler function with the signature: (request: Request) => Response | Promise<Response>`,
						);
					}
					updateHandler = async () => {
						devHandler = (
							await server.ssrLoadModule(vono2.adaptor.developmentRuntime)
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
			handleHotUpdate: async (ctx) => {
				const containsEntry = (mod) => {
					if (!mod.id) return false;
					if (
						stripExt(mod.id) === slash(join(viteConfig.root, vono2.serverEntry))
					) {
						return true;
					}
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
						await fs.writeFile(
							join(vono2.adaptor.outputDirectory, "vono.json"),
							JSON.stringify({
								clientOutputDirectory: viteConfig.build?.outDir,
							}),
						);
						const { spawn } = await import("child_process");
						await vono2.adaptor.buildStart?.();
						const child = spawn("vite", ["build", "--ssr"], { shell: true });
						let complete;
						const p = new Promise((resolve) => {
							complete = resolve;
						});
						child.on("disconnect", () => {
							complete?.();
						});
						child.on("exit", () => {
							complete?.();
						});
						child.on("error", async (err) => {
							await vono2.adaptor.buildError?.(err);
							throw new Error(`Failed to build server: ${err}`);
						});
						child.stderr.pipe(process.stdout);
						child.stdout.pipe(process.stdout);
						await p;
						if (!vono2.includeIndexHtml) {
							try {
								await fs.rm(join(viteConfig.build.outDir, "index.html"));
							} catch {}
						}
						await vono2.adaptor.prerender?.();
						await vono2.adaptor.buildEnd?.();
						return;
					}
				},
			},
		},
	];
}
