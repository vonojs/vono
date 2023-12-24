import { Plugin } from "vite";
import { generateConfig, InlineConfig } from "./config";
import { createDevServer, registerDevServer } from "./devServer";
import { vfsPlugin } from "./vfs";
import { httpPlugin } from "./http";
import { PLUGIN_NAME } from "./constants";
import * as build from "./build";
import { check } from "@gaiiaa/assert";
import { createLogger } from "@gaiiaa/logger";

export const log = createLogger({
	name: PLUGIN_NAME,
	level: 0,
});

export default function serverPlugin(config: InlineConfig = {}): Array<Plugin> {
  const c = generateConfig(config);
  return [
    httpPlugin(),
    vfsPlugin(c.vfs),
    {
      name: PLUGIN_NAME,
      enforce: "pre",
      config: () => ({
        appType: "custom",
        build: {
          outDir: c.adaptor.publicDir,
          manifest: "manifest.json",
        },
      }),
      configResolved: async (config) => {
        c.root = config.root;
        c.mode = config.command ?? "dev";
        await build.createVirtualServerEntry(c);
      },
      configureServer: (server) => registerDevServer(server, c),
      handleHotUpdate: async (ctx) => {
        createDevServer(c, ctx.server);
      },
      writeBundle: {
        sequential: true,
        handler: async () => {
          await build.buildServer(c);
          // await build.writeArtifacts(c);
          if (check(Function, c.adaptor.onBuild)) await c.adaptor.onBuild();
        },
      },
    },
  ];
}
