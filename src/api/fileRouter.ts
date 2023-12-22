import { InternalConfig } from "../config";
import { assert } from "../tools/invariant";
import * as pathe from "pathe";
import * as fs from "fs/promises";
import * as tools from "../tools";

type RouteConfig = {
	[key: string]: any;
};

/* 
	Filter logic
	 Recursively walk the server directory
	 Register deepest routes first
	 Register normal routes first, then param routes, then wildcard routes
*/

function stripExtension(path: string) {
	return path.slice(0, path.lastIndexOf("."));
}

export async function parseFileRoutes(
	config: InternalConfig
): Promise<RouteConfig> {
	assert(config.root, "parseFileRoutes() > config.root is not defined");
	const fullServerDir = pathe.join(config.root, config.server.directory);
	if (!(await tools.exists(fullServerDir))) {
		return {};
	}

	async function getRoutes(dir: string, routeConfig: RouteConfig) {
		const files = await fs.readdir(dir, { withFileTypes: true });
		const routes = files.filter((f) => f.isFile());
		const directories = files.filter((f) => f.isDirectory());
		for (const directory of directories) {
			await getRoutes(pathe.join(dir, directory.name), routeConfig);
		}
		const indexRoute = routes.find((f) => stripExtension(f.name) === "index");
		const paramRoute = routes.find((f) => f.name.startsWith("("));
		const catcherRoute = routes.find((f) => f.name.startsWith("..."));
		const normalRoutes = routes.filter(
			(f) =>
				!f.name.startsWith("(") &&
				!f.name.startsWith("...") &&
				!(stripExtension(f.name) === "index")
		);
		const root = dir.replace(fullServerDir, "") + "/";
		if (indexRoute) {
			routeConfig[root !== "/" ? root.substring(0, root.length - 1) : root] =
				pathe.join(dir, indexRoute.name);
		}
		for (const route of normalRoutes) {
			routeConfig[root + stripExtension(route.name)] = pathe.join(
				dir,
				route.name
			);
		}
		if (paramRoute) {
			routeConfig[
				root +
					stripExtension(paramRoute.name).replace("(", ":").replace(")", "")
			] = pathe.join(dir, paramRoute.name);
		}
		if (catcherRoute) {
			routeConfig[root + "*"] = pathe.join(dir, catcherRoute.name);
		}
	}
	const routeConfig: RouteConfig = {};
	await getRoutes(fullServerDir, routeConfig);
	return routeConfig;
}
