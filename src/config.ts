import defu from "defu";
import { VFS, createVFS } from "./vfs";
import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import * as fs from "fs/promises";

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export enum BuildTarget {
	node,
	deno,
	cloudflare,
	netlify,
	vercel,
}

type Config = {
	target: BuildTarget;
	debug: boolean;
	server: {
		directory: string;
		entry?: string;
		actions: {
			directory: string;
			endpoint: string;
		};
	};
  typescript: {
    writeTypes: boolean;
  }
	entries?: {
		client?: string;
		server?: string;
	}
};

export type InternalConfig = Config & {
	hono?: string;
	root?: string;
	vfs: VFS;
};

export type InlineConfig = RecursivePartial<Config> & {};

export function generateConfig(config?: InlineConfig) {
	return defu<InternalConfig, InternalConfig[]>(config, {
		target: BuildTarget.node,
		debug: false,
		vfs: createVFS(),
		server: {
			directory: "server",
			actions: {
				directory: "server/actions",
				endpoint: "/__actions",
			},
		},
    typescript: {
      writeTypes: true,
    },
	});
}

async function writeTSConfig(config: InternalConfig) {
	try {
		const tsConfigJSON = await fs.readFile(`tsconfig.json`, "utf-8");
		const tsConfig = JSON.parse(tsConfigJSON);
		if (!tsConfig) {
			fs.writeFile(
				`tsconfig.json`,
				JSON.stringify({
					include: ["node_modules/.vpb"],
				})
			);
			return;
		} else {
			tsConfig.include ??= [];
			tsConfig.include.push("node_modules/.vpb");
			fs.writeFile(`tsconfig.json`, JSON.stringify(tsConfig));
		}
	} catch {
		fs.writeFile(
			`tsconfig.json`,
			JSON.stringify({
				include: ["node_modules/.vpb"],
			})
		);
	}
}

async function getEntryPoints(config: InternalConfig, viteConfig: vite.UserConfig) {
	config.entries ??= {};
	// Entry points manually specified
	if(config.entries.client && config.entries.server) return;
	/* 
	 * We need to find the entry points automatically.
	 * Let's start by looking in vite config for a manually specified entry point.
	 * We will look one level deep for entry points.
	 * We'll look for an html file for the client entry.
	 */
	let clientEntry = viteConfig.build?.rollupOptions?.input;
	let serverEntry;


	if(!clientEntry){
		// find the entry point in the root directory
	}

}

export function configPlugin(config: InternalConfig): vite.Plugin {
	return {
		name: `${PLUGIN_NAME}:config`,
		enforce: "pre",
		config: async (viteConfig) => {
			viteConfig.clearScreen = false;
			viteConfig.appType = "custom";
			if(config.typescript.writeTypes) await writeTSConfig(config);
		},
		configResolved: (viteConfig) => {
			config.root = viteConfig.root;
		},
	};
}
