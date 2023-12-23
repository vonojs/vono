import { InternalConfig } from "./config";
import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import { Server, notfound } from "./runtime/server";
import { handleNodeRequest } from "./tools/node-hono";
import * as fs from "fs/promises";
import * as pathe from "pathe";

export function devServerPlugin(config: InternalConfig): vite.Plugin {
	return {
		name: `${PLUGIN_NAME}:dev-server`,
		enforce: "pre",
		configureServer: (server) => {
			return async () => {
				const app = new Server();
				/* load the entry */
				let entry;
				try {
					entry = await server.ssrLoadModule(
						pathe.join(config.root, config.server.directory, config.server.entry)
					);
				} catch (e) {}
				entry && app.route("/", entry.default);
				// server fallback to index.html
				app.get("*", async (c) => {
					const raw = await fs.readFile(
						pathe.join(config.root!, "index.html"),
						"utf-8"
					);
					if (!raw) {
						throw notfound();
					}
					return new Response(await server.transformIndexHtml(c.url, raw), {
						headers: {
							"content-type": "text/html",
						},
					})
				});
				server.middlewares.use((req, res, next) => {
					if (req.url?.startsWith("/@id/")) {
						return next();
					}
					handleNodeRequest(app, req, res);
				});
			};
		},
	};
}
