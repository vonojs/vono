import defu from "defu";
import { VFS, createVFS } from "./vfs";
import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import * as fs from "fs/promises";

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

import { Adaptor } from "./adaptors";
import nodeAdaptor from "./adaptors/node";

type Config = {
	adaptor: Adaptor;
	debug: boolean;
	server: {
		directory: string;
		entry: string;
		actions: {
			directory: string;
			endpoint: string;
		};
	};
  typescript: {
    writeTypes: boolean;
  }
};

export type InternalConfig = Config & {
	hono?: string;
	root: string;
	vfs: VFS;
	mode?: "build" | "serve" | "dev";
};

export type InlineConfig = RecursivePartial<Config> & {};

export function generateConfig(config?: InlineConfig) {
	return defu<InternalConfig, InternalConfig[]>(config, {
		adaptor: nodeAdaptor(),
		debug: false,
		vfs: createVFS(),
		server: {
			directory: "server",
			entry: "index",
			actions: {
				directory: "server/actions",
				endpoint: "/__actions",
			},
		},
		root: process.cwd(),
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

export function configPlugin(config: InternalConfig): vite.Plugin {
	return {
		name: `${PLUGIN_NAME}:config`,
		enforce: "pre",
		config: () => {
			// if(config.typescript.writeTypes) await writeTSConfig(config);
			return {
				clearScreen: false,
				appType: "custom",
			}
		},
		configResolved: (viteConfig) => {
			config.root = viteConfig.root;
			config.mode = viteConfig.command ?? "dev"
		},
	};
}
