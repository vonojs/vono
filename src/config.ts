import defu from "defu";
import { VFile } from "./plugins/vfs";
import * as fs from "fs/promises";
import { Adaptor } from "./adaptors";
import nodeAdaptor from "./adaptors/node";
import { check } from "@gaiiaa/assert"
import Server from "./runtime/server";

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
	prerender: {
		routes: Array<string>;
	},
	dev: {
		port: number;
	}
};

export type InternalConfig = Config & {
	devServer?: Server
	root: string;
	vfs: Map<string, VFile>;
	mode?: "build" | "serve" | "dev";
};

export type InlineConfig = {
	adaptor?: Adaptor;
	prerender?: {
		routes: Array<string>;
	},
	dev?: {
		port: number;
	}
};

export function generateConfig(config?: InlineConfig) {
	const adaptor = config?.adaptor ?? nodeAdaptor();
	const validAdaptor = check(adaptor, {
		name: String,
		outDir: String,
		serverDir: String,
		publicDir: String,
		entryName: String,
	})

	if(!validAdaptor) throw new Error("Invalid adaptor settings.")

	return defu<InternalConfig, InternalConfig[]>(config, {
		adaptor,
		debug: false,
		vfs: new Map<string, VFile>(),
		server: {
			directory: "server",
			entry: "entry",
			actions: {
				directory: "server/actions",
				endpoint: "/__actions",
			},
		},
		root: process.cwd(),
    typescript: {
      writeTypes: true,
    },
		prerender: {
			routes: [],
		},
		dev: {
			port: 8000,
		}
	});
}

export async function writeTSConfig(config: InternalConfig) {
	try {
		const tsConfigJSON = await fs.readFile(`tsconfig.json`, "utf-8");
		const tsConfig = JSON.parse(tsConfigJSON);
		if (!tsConfig) {
			fs.writeFile(
				`tsconfig.json`,
				JSON.stringify({
					include: ["node_modules/.vpb/*"],
				})
			);
			return;
		} else {
			tsConfig.include ??= [];
			!tsConfig.include.find("node_modules/.vpb/*") && tsConfig.include.push("node_modules/.vpb/*");
			fs.writeFile(`tsconfig.json`, JSON.stringify(tsConfig));
		}
	} catch {
		fs.writeFile(
			`tsconfig.json`,
			JSON.stringify({
				include: ["node_modules/.vpb/*"],
			})
		);
	}
}

