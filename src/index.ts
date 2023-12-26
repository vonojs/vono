import { Plugin } from "vite";
import { Config, generateConfig, UserConfig, writeTSConfig } from "./config";
import { createDevServer, registerDevServer } from "./devServer";
import { VFile, vfsPlugin } from "./plugins/vfs";
import { httpPlugin } from "./plugins/http";
import { PLUGIN_NAME } from "./constants";
import * as build from "./build";
import { check } from "@gaiiaa/assert";
import { createLogger } from "@gaiiaa/logger";
import { prerender } from "./prerender";
import * as pathe from "pathe";
import * as fs from "fs/promises";
import { writeTypes } from "./types";
import nodeAdaptor from "./adaptors/node";
import { Adaptor } from "./adaptors";

export const log = createLogger({
  name: PLUGIN_NAME,
  level: 0,
});

export default function serverPlugin(userConfig?: UserConfig): Array<Plugin> {
  const vfs = new Map<string, VFile>();
  const adaptor = (userConfig?.adaptor ?? nodeAdaptor()) as Adaptor;

  let c: Config;
  return [
    httpPlugin(),
    vfsPlugin(vfs),
    {
      name: PLUGIN_NAME,
      enforce: "pre",
      config: (vite) => ({
        appType: "custom",
        clearScreen: false,
        resolve: {
          alias: vite.build?.ssr ? adaptor.env?.alias : undefined,
        },
        ssr: {
          noExternal: true,
          external: adaptor.env?.external,
        },
        build: {
          emptyOutDir: !vite.build?.ssr,
          outDir: vite.build?.ssr ? adaptor.serverDir : adaptor.publicDir,
          manifest: true,
          rollupOptions: vite.build?.ssr
            ? {
              output: {
                chunkFileNames: "[name].[hash].[format].js",
                inlineDynamicImports: adaptor.inlineDynamicImports,
              },
              input: {
                [adaptor.entryName ?? "index"]: adaptor.runtime,
              },
              external: adaptor.env?.external,
            }
            : undefined,
        },
      }),
      configResolved: async (vite) => {
        c = generateConfig(userConfig, {
          root: vite.root,
          mode: vite.command ?? "dev",
          ssr: !!vite.build?.ssr,
          adaptor,
          vfs,
        });
        await build.createVirtualServerEntry({
          root: c.root,
          serverDir: c.server.directory,
          serverEntry: c.server.entry,
          vfs,
        });
        vite.build.ssr && c.vfs.set("/template", {
          path: "/template",
          content: async () => {
            const raw = await fs.readFile(
              pathe.join(c.root, c.adaptor.publicDir, "index.html"),
              "utf-8",
            );
            return `export default \`${raw}\`;`;
          },
        });
        await writeTSConfig();
        await writeTypes();
      },
      configureServer: (server) => registerDevServer(server, c),
      handleHotUpdate: async (ctx) => {
        if (ctx.modules.find((m) => m.file?.includes(c.server.directory))) {
          const t = performance.now();
          await createDevServer(c, ctx.server);
          log.info(
            "reloaded server in",
            (performance.now() - t).toFixed(1),
            "ms",
          );
        }
      },
      writeBundle: async (x) => {
        if(!c.ssr) return;
        if (check(Function, c.adaptor.onBuild)) await c.adaptor.onBuild();
        if (c.prerender.routes.length > 0) {
          const handler = await import(
            pathe.join(
              c.root,
              c.adaptor.serverDir,
              c.adaptor.entryName + ".js",
            )
          ).then((m) => m.default.fetch);
          await prerender({
            handler,
            routes: c.prerender.routes,
            outDir: c.adaptor.publicDir,
          });
        }
      },
    },
  ];
}
