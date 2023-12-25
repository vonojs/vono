import { Plugin } from "vite";
import { generateConfig, InlineConfig } from "./config";
import { createDevServer, registerDevServer } from "./devServer";
import { vfsPlugin } from "./plugins/vfs";
import { httpPlugin } from "./plugins/http";
import { PLUGIN_NAME } from "./constants";
import * as build from "./build";
import { check } from "@gaiiaa/assert";
import { createLogger } from "@gaiiaa/logger";
import { prerender } from "./prerender";
import * as pathe from "pathe";
import * as fs from "fs/promises";

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
        clearScreen: false,
        build: {
          outDir: c.adaptor.publicDir,
          manifest: "manifest.json",
        },
        server: {
          port: c.dev.port,
        }
      }),
      configResolved: async (config) => {
        c.root = config.root;
        c.mode = config.command ?? "dev";
        await build.createVirtualServerEntry(c);
        c.mode === "build" && c.vfs.set("/template", {
          path: "/template",
          content: async () => {
            const raw = await fs.readFile(
              pathe.join(c.root, c.adaptor.publicDir, "index.html"),
              "utf-8",
            );
            return `export default \`${raw}\`;`;
          },
        })
      },
      configureServer: (server) => registerDevServer(server, c),
      handleHotUpdate: async (ctx) => {
        if (ctx.modules.find((m) => m.file?.includes(c.server.directory))) {
          log.info("Server file modified, restarting dev server");
          createDevServer(c, ctx.server);
        }
      },
      writeBundle: {
        sequential: true,
        handler: async () => {
          await build.buildServer(c);
          // await build.writeArtifacts(c);
          if (check(Function, c.adaptor.onBuild)) await c.adaptor.onBuild();
          if (globalThis.SERVER_BUILT && c.prerender.routes.length > 0) {
            await prerender({
              routes: c.prerender.routes,
              handler: await import(
                pathe.join(
                  c.root,
                  c.adaptor.serverDir,
                  c.adaptor.entryName + ".js",
                )
              ).then((m) => m.default.fetch),
              outDir: c.adaptor.publicDir,
            });
          }
        },
      },
    },
  ];
}
