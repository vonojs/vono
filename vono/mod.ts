import {createConfig, Vono} from "./config";
import {ModuleNode, type Plugin, ResolvedConfig} from "vite";
import vfsPlugin from "./plugins/vfs";
import {useVFS} from "./vfs";
import {httpPlugin} from "./plugins/http";
import {createRequest, handleNodeResponse} from "./tools/req-res";
import { join } from "node:path"
import {resolveExt, slash, stripExt} from "./tools/resolve";
import manifest from "./plugins/manifest";
import shell from "./plugins/shell";
import * as fs from "fs/promises";


export default function vono(config: Partial<Vono> = {}): Plugin[] {
	let devHandler: any;
	let updateHandler: any;
	const vono = createConfig(config);
	let viteConfig: ResolvedConfig

	return [
		httpPlugin(),
		manifest({ manifest: "client/.vite/manifest.json"}),
		shell(),
		vfsPlugin({vfs: useVFS(), alias: "#vono"}),
		{
			name: "vono:main",
			enforce: "pre",
			config: (vite) => {
				const ssr = <T>(content: T) => vite.build?.ssr ? content : undefined;
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
						emptyOutDir: !ssr,
						outDir: ssr(true) ? join(root, vono.adaptor.outputDirectory) : join(root, vono.adaptor.outputDirectory, "client"),
						manifest: !ssr(true),
						ssrEmitAssets: false,
						ssr: ssr(true),
						rollupOptions: ssr({
							input: {
								server: vono.adaptor.productionRuntime,
							},
							output: {
								inlineDynamicImports: vono.adaptor.inlineDynamicImports,
							},
							external:  vono.adaptor.external,
						})
					}
				}
			},
			configResolved: async (vite) => {
				viteConfig = vite;

				useVFS().add({
					path: "entry",
					serverContent: () => `export {default} from "${slash(join(viteConfig.root, vono.serverEntry))}";`,
				})

				let buildctx: any;
				if(viteConfig.build?.ssr) {
					buildctx = {
						...(await fs.readFile(join(vono.adaptor.outputDirectory, "vono.json"), "utf-8").then((content) => JSON.parse(content))),
					}
				} else {
					// not needed at the moment
					buildctx = {}
				}

				useVFS().add({
					path: "buildctx",
					serverContent: () => `export default ${
						JSON.stringify(buildctx, null, 2)
					}`,
				})

			},
			configureServer: (server) => {
				return async () => {
					if(!resolveExt(join(viteConfig.root, vono.serverEntry))) {
						throw new Error(`Could not find server entry @ ${vono.serverEntry}. Please provide a path to a file that exports a default handler function with the signature: (request: Request) => Response | Promise<Response>`)
					}
					updateHandler = async () => {
						devHandler = (await server.ssrLoadModule(vono.adaptor.developmentRuntime)).default;
					}
					await updateHandler()
					server.middlewares.use(async (nodeRequest, nodeResponse, next) => {
						try {
							const request = createRequest(nodeRequest, nodeResponse);
							const response = await devHandler(request);
							return handleNodeResponse(response, nodeResponse);
						} catch(e) {
							console.error(e);
							next();
						}
					})
				}
			},
			handleHotUpdate: async (ctx) => {
				const containsEntry = (mod: ModuleNode): boolean => {
					if(!mod.id) return false;
					if(stripExt(mod.id) === slash(join(viteConfig.root, vono.serverEntry))) {
						return true;
					}
					for(const dep of mod.importers){
						if(containsEntry(dep)) return true;
					}
					return false;
				}
				if(ctx.modules.some(containsEntry)) {
					await updateHandler()
					ctx.server.hot.send({type: "full-reload"})
				}
			},

			writeBundle: {
				sequential: true,
				order: "post",
				handler: async () => {
					if (!viteConfig.build?.ssr) {
						await fs.writeFile(join(vono.adaptor.outputDirectory, "vono.json"), JSON.stringify({
							clientOutputDirectory: viteConfig.build?.outDir,
						}))
						const { spawn } = await import("child_process");
						await vono.adaptor.buildStart?.()
						const child = spawn("vite", ["build", "--ssr"], { shell: true});
						let complete: (() => void);
						const p = new Promise<void>((resolve) => {
							complete = resolve;
						});
						child.on("disconnect",  () => {
							complete?.();
						});
						child.on("exit",  () => {
							complete?.();
						});
						child.on("error", async (err) => {
							await vono.adaptor.buildError?.(err);
							throw new Error(`Failed to build server: ${err}`);
						});
						child.stderr.pipe(process.stdout);
						child.stdout.pipe(process.stdout);
						await p;
						if(!vono.includeIndexHtml){
							try {
								await fs.rm(join(viteConfig.build.outDir, "index.html"))
							} catch {}
						}
						await vono.adaptor.prerender?.()
						await vono.adaptor.buildEnd?.();
						return;
					}
				},
			},
		}
	]
}