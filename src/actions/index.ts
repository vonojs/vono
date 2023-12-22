import { assert } from "../tools/invariant";
import { exists, stripExtension } from "../tools";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import * as templates from "./templates";

type ActionConfig = {
	path: string;
	handlerUrl: string;
};

export type ActionManifest = {
	[key: string]: string;
};

function recursiveSet(target: object, path: string[], value: any) {
	const [key, ...rest] = path;
	if (rest.length === 0) {
		target[key] = value;
	} else {
		target[key] ??= {};
		recursiveSet(target[key], rest, value);
	}
}

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
					.replace(/^\//, "")
					.split("/");

				recursiveSet(
					manifest,
					path,
					pathe.join(actionFile.path, actionFile.name)
				);
			}
		}
		const actionConfig: ActionManifest = {};
		await getActions(actionsDir, actionConfig);
		return actionConfig;
	}

	function generateTypes(manifest: ActionManifest) {
		const recurse = (manifest: ActionManifest): string[] =>
			Object.entries(manifest).map(([key, value]) => {
				if (typeof value === "object") {
					return `'${key}': { ${recurse(value)} },`;
				}
				return `'${key}': typeof import("${value}"),`;
			});
		const items = recurse(manifest);

		return `/* This file is generated */
${templates.recursiveAwaitable}

export type Manifest = {
	${items.join("\n\t")}
};

export type Actions = RecursiveAwaitable<Manifest>;`;
	}

	return {
		generateManifest,
		generateTypes,
	};
}