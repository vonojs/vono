import { Plugin, ViteDevServer } from "vite";
import { createVono, UserConfig, Vono } from "../config";
import { vfsPlugin } from "./plugins/vfs";
import { httpPlugin } from "./plugins/http";
import { check } from "@gaiiaa/assert";
import { prerender } from "../prerender";
import * as pathe from "pathe";
import nodeAdaptor from "../adaptors/node";
import { Adaptor } from "../adaptors";
import { join } from "path";
import * as fs from "fs/promises";
import { writeTypes } from "../types";
import { VFS } from "./plugins/vfs";
import { handleNodeRequest } from "../tools/node-hono";
import { createDevServer } from "./dev";
import { runtimeDir } from "../runtime";
import { createVirtualServerEntry } from "./build";
import manifestPlugin from "./plugins/manifest";

export default function vono(userConfig?: UserConfig): Array<Plugin> {
  const vfs = new VFS();

  const adaptor = (userConfig?.adaptor ?? nodeAdaptor()) as Adaptor;

  /* our config is ready for all plugins that run after configResolved.
  As far as I know, that's all of them besides config() */
  let vono: Vono;
  /* I'm not happy about a potentially undefined reference here.
  TODO: change to ViteDevServer | undefined and force us to assert
  when using it. Thankfully thus far it's confined to metadata vfs stuff*/
  let viteDevServer: ViteDevServer;
  return [
    httpPlugin(),
    manifestPlugin({
      manifest: () =>
        join(vono.root, vono.adaptor.publicDir, ".vite", "manifest.json"),
    }),
    vfsPlugin({ vfs }),
    {
      name: "vono",
      enforce: "pre",
      config: (vite) => ({
        appType: "custom",
        clearScreen: false,
        resolve: {
          alias: vite.build?.ssr ? adaptor.env?.alias : undefined,
        },
        ssr: vite.build?.ssr
          ? {
            noExternal: true,
            external: adaptor.env?.external,
          }
          : undefined,
        build: {
          emptyOutDir: !vite.build?.ssr,
          outDir: vite.build?.ssr ? adaptor.serverDir : adaptor.publicDir,
          manifest: !vite.build?.ssr,
          rollupOptions: vite.build?.ssr
            ? {
              output: {
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
      /* We're treating this hook like the setup function. */
      configResolved: async (vite) => {
        /* generate the config used for the rest of the plugin.
        This will be accessible everywhere beyond this point. */
        vono = createVono(userConfig, {
          root: vite.root,
          mode: vite.command ?? "dev",
          ssr: !!vite.build?.ssr,
          adaptor,
          vfs: vfs,
        });

        // create gen directory
        await fs.mkdir("node_modules/.vono", { recursive: true });

        /* We want to set our SSR build inputs to just our input file.
        This way we aren't building client entries for the server build if
        the user happens to provide manual rollup inputs. */
        if (vite.build.ssr) {
          vite.build.rollupOptions.input = {
            [adaptor.entryName ?? "index"]: adaptor.runtime,
          };
        }

        /* create our server entry.
        This is what adaptors import. */
        await createVirtualServerEntry({
          root: vono.root,
          serverDir: vono.server.directory,
          serverEntry: vono.server.entry,
          vfs,
        });

        /* lets write our entry and type to temporary files. */
        await fs.writeFile(
          "node_modules/.vono/entry.ts",
          `import App from "${
            join(vono.root, vono.server.directory, vono.server.entry)
          }; export default App; export type AppType = typeof App;`,
        );

        /* create virtual RPC files */
        vfs.add({
          path: "/rpc",
          serverContent: () =>
            `export rpc from "${join(runtimeDir, "rpc.server")}";`,
          clientContent: () =>
            `export rpc from "${join(runtimeDir, "rpc.client")}";`,
        });

        await writeTypes();
      },
      /* This is where we run our dev server setup. */
      configureServer: (server) => {
        viteDevServer = server;
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
      writeBundle: async () => {
        if (!vono.ssr) return;
        if (check(Function, vono.adaptor.onBuild)) await vono.adaptor.onBuild();
        if (vono.prerender.routes.length > 0) {
          const handler = await import(
            pathe.join(
              vono.root,
              vono.adaptor.serverDir,
              vono.adaptor.entryName + ".js",
            )
          ).then((m) => m.default.fetch);
          await prerender({
            handler,
            routes: vono.prerender.routes,
            outDir: vono.adaptor.publicDir,
          });
        }
      },
    },
  ];
}
