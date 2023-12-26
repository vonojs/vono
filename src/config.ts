import defu from "defu";
import { VFile } from "./plugins/vfs";
import * as fs from "fs/promises";
import { Adaptor } from "./adaptors";
import nodeAdaptor from "./adaptors/node";
import { Infer, Maybe, Optional, check } from "@gaiiaa/assert";
import Server from "./runtime/server";

export type Config = {
	devServer?: Server;
  root: string;
  vfs: Map<string, VFile>;
  mode?: "build" | "serve" | "dev";
  buildTarget?: "server" | "client";
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
  };
  prerender: {
    routes: Array<string>;
  };
  ssr: boolean;
};

const adaptorSchema = {
	name: String,
	outDir: String,
	serverDir: String,
	publicDir: String,
	entryName: String,
	runtime: String,
}

const userConfigSchema = {
	adaptor: Maybe(adaptorSchema),
	prerender: Maybe({
		routes: Array(String),
	}),
	debug: Maybe(Boolean),
}

export type UserConfig = Infer<typeof userConfigSchema>;

export function generateConfig(userConfig: UserConfig | undefined, options: {
  root: string;
  mode: "build" | "serve" | "dev";
  ssr: boolean;
	vfs: Map<string, VFile>;
  adaptor: Adaptor;
}): Config {

	const validUserConfig = check(userConfig, userConfigSchema)
	if(!validUserConfig) throw new Error("Invalid user config.")

  return {
    adaptor: options.adaptor,
    debug: !!userConfig?.debug,
    vfs: options.vfs,
    server: {
      directory: "server",
      entry: "entry",
      actions: {
        directory: "server/actions",
        endpoint: "/__actions",
      },
    },
    root: options.root,
    typescript: {
      writeTypes: true,
    },
    prerender: {
      routes: userConfig?.prerender?.routes ?? [],
    },
    ssr: options.ssr,
  }
}

export async function writeTSConfig() {
  try {
    const tsConfigJSON = await fs.readFile(`tsconfig.json`, "utf-8");
    const tsConfig = JSON.parse(tsConfigJSON);
    if (!tsConfig) {
      fs.writeFile(
        `tsconfig.json`,
        JSON.stringify({
          include: ["node_modules/.vpb/*"],
        }),
      );
      return;
    } else {
      tsConfig.include ??= [];
      !tsConfig.include.find("node_modules/.vpb/*") &&
        tsConfig.include.push("node_modules/.vpb/*");
      fs.writeFile(`tsconfig.json`, JSON.stringify(tsConfig));
    }
  } catch {
    fs.writeFile(
      `tsconfig.json`,
      JSON.stringify({
        include: ["node_modules/.vpb/*"],
      }),
    );
  }
}
