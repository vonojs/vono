import { assert } from "../tools/invariant";
import { deepGet, exists, stripExtension } from "../tools";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import { handleRequest } from "./handler";

type ActionConfig = {
	path: string;
	handlerUrl: string;
};

export type ActionManifest = {
	[key: string]: string;
};

export function createActions(config: ActionConfig) {
	async function generateManifest(): Promise<ActionManifest> {
		assert(config.path, "parseServerActions() > config.root is not defined");
		const actionsDir = pathe.join(process.cwd(), config.path);
		if (!(await exists(actionsDir))) {
			return {};
		}
		async function getActions(dir: string, manifest: ActionManifest) {
			const files = await fs.readdir(dir, {
				withFileTypes: true,
				recursive: true,
			});
			const actions = files.filter((f) => f.isFile());
			for (const actionFile of actions) {
				let path = pathe
					.join(
						actionFile.path.replace(actionsDir, ""),
						stripExtension(actionFile.name)
					)
					.replaceAll("/", ".")
					.replace(/^\./, "");
				manifest[path] = pathe.join(actionFile.path, actionFile.name);
			}
		}
		const actionConfig: ActionManifest = {};
		await getActions(actionsDir, actionConfig);
		return actionConfig;
	}
	const generateClientApi = (
		manifest: ActionManifest
	) => `/* This file is generated */
const manifest = ${JSON.stringify(manifest, null, 2)};
const createProxy = (path: string[] = []) => {
	return new Proxy(() => {}, {
		get: (_, key: string) => {
			return createProxy([...path, key]);
		},
		apply: async (_, __, args) => {
			const res = await fetch("${config.handlerUrl}", {
				method: "POST",
				body: JSON.stringify({
					path,
					args,
				}),
			})
			if (res.status === 200) {
				return res.json();
			}
			throw new Error("Error");
		},
	});
};
const actions = createProxy();
export default actions;`;

	const generateServerApi = (manifest: ActionManifest) => `/* This file is generated */
const manifest = ${JSON.stringify(manifest, null, 2)};
const createProxy = (path: string[] = []) => {
	return new Proxy(() => {}, {
		get: (_, key: string) => {
			return createProxy([...path, key]);
		},
		apply: async (_, __, args) => {
			try {
				const actionName = path.pop();
				const file = await import(manifest[path.join(".")]);
				if (!actionName || !(actionName in file)) {
					return null;
				}
				return file[actionName](...args);
			} catch {
				return null;
			}
		},
	});
};
const actions = createProxy();
export default actions;
`;

	return {
		generateManifest,
		generateClientApi,
		generateServerApi,
	};
}
