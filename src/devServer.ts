import { InternalConfig } from "./config";
import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import { Hono } from "hono";
import { handleNodeRequest } from "./tools/node-hono";
import * as fs from "fs/promises";
import * as pathe from "pathe";

export function devServerPlugin(config: InternalConfig): vite.Plugin {
	return {
		name: `${PLUGIN_NAME}:dev-server`,
		enforce: "pre",
		configureServer: (server) => {
			return async () => {
				const hono = new Hono();
				/* load the entry */
				let entry;
				try {
					entry = await server.ssrLoadModule(
						pathe.join(config.root!, "server.entry")
					);
				} catch (e) {}
				entry && hono.route("/", entry.default);
				// server fallback to index.html
				hono.get("*", async (c) => {
					const raw = await fs.readFile(
						pathe.join(config.root!, "index.html"),
						"utf-8"
					);
					if (!raw) {
						return c.notFound();
					}
					return c.html(server.transformIndexHtml(c.req.url, raw));
				});
				server.middlewares.use((req, res, next) => {
					if (req.url?.startsWith("/@id/")) {
						return next();
					}
					handleNodeRequest(hono, req, res, next);
				});
			};
		},
	};
}
