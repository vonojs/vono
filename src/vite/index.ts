import { Plugin } from "vite";
import { createVono, UserConfig, Vono } from "../config";
import { vfsPlugin } from "./plugins/vfs";
import { httpPlugin } from "./plugins/http";
import { check } from "@gaiiaa/assert";
import { prerender } from "../prerender";
import * as pathe from "pathe";
import { nodeServer }  from "../adapters";
import { Adapter } from "../adapters";
import { join } from "path";
import * as fs from "fs/promises";
import { writeTypes } from "./types";
import { useVFS } from "../vfs";
import { handleNodeRequest } from "../tools/node-hono";
import { createDevServer } from "./dev";
import { createVirtualServerEntry } from "./virtualEntry";
import manifestPlugin from "./plugins/manifest";
import rpcPlugin from "./plugins/rpc";
import { log } from "../logger";

export default function vono(userConfig?: UserConfig): Array<Plugin> {
  const adapter = (userConfig?.adapter ?? nodeServer()) as Adapter;
  let vono: Vono;
  return [
    httpPlugin(),
    manifestPlugin({
      manifest: () =>
        join(vono.root, vono.adapter.publicDir, ".vite", "manifest.json"),
    }),
    rpcPlugin(),
    vfsPlugin({ vfs: useVFS() }),
    {
      name: "vono",
      enforce: "pre",
      config: (vite) => ({
        appType: "custom",
        clearScreen: false,
        resolve: {
          alias: vite.build?.ssr ? adapter.env?.alias : undefined,
        },
        ssr: vite.build?.ssr
          ? {
              noExternal: true,
              external: adapter.env?.external,
            }
          : undefined,
        build: {
          emptyOutDir: !vite.build?.ssr,
          outDir: vite.build?.ssr ? adapter.serverDir : adapter.publicDir,
          manifest: true,
          ssrEmitAssets: false,
          rollupOptions: vite.build?.ssr
            ? {
                output: {
                  inlineDynamicImports: adapter.inlineDynamicImports,
                  chunkFileNames: "chunks/[name]-[hash].js",
                },
                input: {
                  [adapter.entryName ?? "index"]: adapter.runtime,
                },
                external: adapter.env?.external,
              }
            : undefined,
        },
      }),
      /* We're treating this hook like the setup function. */
      configResolved: async (vite) => {
        /* generate the config used for the rest of the plugin.
        This will be accessible everywhere beyond this point. */
        vono = createVono(userConfig, {
          root: vite.root,
          mode: vite.command ?? "dev",
          ssr: !!vite.build?.ssr,
          adapter,
          vfs: useVFS(),
        });

        // create gen directory
        await fs.mkdir("node_modules/.vono", { recursive: true });

        /* We want to set our SSR build inputs to just our input file.
        This way we aren't building client entries for the server build if
        the user happens to provide manual rollup inputs. */
        if (vite.build.ssr) {
          vite.build.rollupOptions.input = {
            [adapter.entryName ?? "index"]: adapter.runtime,
          };
        }

        /* create our server entry.
        This is what adapters import. */
        await createVirtualServerEntry({
          root: vono.root,
          serverDir: vono.server.directory,
          serverEntry: vono.server.entry,
        });

        /* lets write our entry and type to temporary files. */
        await fs.writeFile(
          "node_modules/.vono/entry.ts",
          `import App from "${join(
            vono.root,
            vono.server.directory,
            vono.server.entry,
          )}"; export default App; export type AppType = typeof App;`,
        );

        await writeTypes();
      },
      /* This is where we run our dev server setup. */
      configureServer: (server) => {
        return async () => {
          await createDevServer({ vono, server });
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith("/@id/")) {
              return next();
            }
            handleNodeRequest(vono.devServer!, req, res);
          });
        };
      },
      /* Need to recreate our server instance when it's modified. */
      handleHotUpdate: async (ctx) => {
        if (ctx.modules.find((m) => m.file?.includes(vono.server.directory))) {
          await createDevServer({ vono, server: ctx.server });
        }
      },
      /* This is where we run our post build stuff */
      writeBundle: {
        sequential: true,
        order: "post",
        handler: async () => {
          if (!vono.ssr) {
            log.info("Building Hono...");
            const { spawn } = await import("child_process");
            const child = spawn("vite", ["build", "--ssr"]);
            let complete: (() => void) | undefined;
            const p = new Promise<void>((resolve) => {
              complete = resolve;
            });
            child.on("disconnect", () => {
              complete?.();
            });
            child.on("exit", () => {
              complete?.();
            });
            child.on("error", () => {
              log.error("Hono build failed.");
              throw new Error("Hono build failed.");
              complete?.();
            });
            child.stderr.pipe(process.stdout);
            await p;
            return;
          }

          if (check(Function, vono.adapter.onBuild))
            await vono.adapter.onBuild();

          await vono.onBuild?.(vono);

          const routes = check(Function, vono.prerender.routes)
            ? await vono.prerender.routes()
            : vono.prerender.routes ?? [];

          if (routes.length > 0) {
            log.info("Prerendering...");
            const _handler = await import(
              pathe.join(
                vono.root,
                vono.adapter.serverDir,
                vono.adapter.entryName + ".js",
              )
            ).then((m) => m.default);
            const handler = _handler.prerenderHandler;
            await prerender({
              handler,
              routes,
              outDir: vono.adapter.publicDir,
            });
          }
        },
      },
    },
  ];
}
