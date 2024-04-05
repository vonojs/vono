import {createConfig, Vono} from "./config";
import {type Plugin, createViteRuntime, ResolvedConfig} from "vite";
import vfsPlugin from "./plugins/vfs";
import {VFS} from "./vfs";
import {httpPlugin} from "./plugins/http";
import {createRequest, handleNodeResponse} from "./tools/req-res";
import { join } from "node:path"

const vfs = new VFS()

export default function vono(config: Partial<Vono> = {}): Plugin[] {
	let devHandler: any;
	let updateHandler: any;
	const vono = createConfig(config);
	let viteConfig: ResolvedConfig;
	return [
		httpPlugin(),
		vfsPlugin({vfs}),
		{
			name: "vono:main",
			enforce: "pre",
			config: (vite) => ({
				appType: "custom",
			}),
			configResolved: (vite) => {
				viteConfig = vite;
			},
			configureServer: (server) => {
				return async () => {
					const runtime = await createViteRuntime(server)
					updateHandler = async () => devHandler = await runtime.executeEntrypoint(
						join(viteConfig.root, vono.serverEntry)
					)
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
			handleHotUpdate: (ctx) => {
				updateHandler()
			},

		}
	]
}