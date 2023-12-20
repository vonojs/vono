import { createActions } from "./actions";
import { InternalConfig } from "./config";
import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import { Hono } from "hono";
import { parseFileRoutes } from "./fileRouter";
import { log } from ".";
import { assert } from "./tools/invariant";
import { handleNodeRequest } from "./tools/node-hono";
import * as fs from "fs/promises";
import * as pathe from "pathe";

function toResponse(data: unknown): Response {
	if (!data) {
		return new Response(null, { status: 204 });
	}
	if (data instanceof Response) {
		return data;
	}
	if (data === "object" || data === "boolean" || data === "number") {
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}
	if (typeof data === "string") {
		return new Response(data, {
			status: 200,
			headers: { "Content-Type": "text/plain" },
		});
	}
	log.error("Unknown response type:", typeof data);
	throw new Error("Unknown response type");
}

export function serverPlugin(config: InternalConfig): vite.Plugin {
	const serverActions = createActions({
		handlerUrl: config.server.actions.endpoint,
		path: config.server.actions.directory,
	});
	return {
		name: `${PLUGIN_NAME}:server`,
		enforce: "pre",
		configureServer: (server) => {
			return async () => {
				const hono = new Hono();
				const routes = await parseFileRoutes(config);
				const actions = await serverActions.generateManifest();
				for (const [r, value] of Object.entries(routes)) {
					hono.get(r, async (c) => {
						try {
							const handler = await server
								.ssrLoadModule(value)
								.then((m) => m.default);
							const result = await handler(c);
							if (result instanceof Response) {
								return result;
							}
							if (typeof result === "object") {
								return c.json(result);
							}
							return c.html(result);
						} catch (e) {
							log.error(e);
							return c.json({
								error: e instanceof Error ? e.message : "unknown error",
							});
						}
					});
				}
				hono.get("*", async (c) => {
					assert(config.root, "root is not defined.");
					const files = await fs.readdir(config.root, {
						withFileTypes: true,
					});
					let rawTemplate = files.find((f) => f.name === "index.html");
					if (!rawTemplate) {
						const dirs = files.filter((f) => f.isDirectory());
						for (const dir of dirs) {
							const files = await fs.readdir(config.root + "/" + dir.name, {
								withFileTypes: true,
							});
							rawTemplate = files.find((f) => f.name === "index.html");
							if (rawTemplate) {
								break;
							}
						}
					}
					const template = rawTemplate
						? server.transformIndexHtml(
								c.req.url,
								await fs.readFile(
									pathe.join(rawTemplate.path, rawTemplate.name),
									"utf-8"
								)
						  )
						: null;
					const assets: string[] = [];
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
