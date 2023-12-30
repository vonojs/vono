import { Plugin, ViteDevServer } from "vite";
import { Config, generateConfig, UserConfig } from "./config";
import { createDevServer, registerDevServer } from "./devServer";
import { VFile, vfsPlugin } from "./plugins/vfs";
import { httpPlugin } from "./plugins/http";
import * as build from "./build";
import { check } from "@gaiiaa/assert";
import { createLogger } from "@gaiiaa/logger";
import { prerender } from "./prerender";
import * as pathe from "pathe";
import nodeAdaptor from "./adaptors/node";
import { Adaptor } from "./adaptors";
import { createMetadata } from "./metadata";
import { join } from "path";
import * as fs from "fs/promises";
import { buildRPC } from "./rpc";
import { writeTypes } from "./types";

export const log = createLogger({
  name: "vono",
  level: 0,
});

export default function serverPlugin(userConfig?: UserConfig): Array<Plugin> {
  const vfs = new Map<string, VFile>();
  const adaptor = (userConfig?.adaptor ?? nodeAdaptor()) as Adaptor;

  /* our config is ready for all plugins that run after configResolved.
  As far as I know, that's all of them besides config() */
  let c: Config;
  /* I'm not happy about a potentially undefined reference here.
  TODO: change to ViteDevServer | undefined and force us to assert
  when using it. Thankfully thus far it's confined to metadata vfs stuff*/
  let devServer: ViteDevServer;
  return [
    httpPlugin(),
    vfsPlugin(vfs),
    {
      name: "vono",
      enforce: "pre",
      /* Ugly config setup. Not ideal but isolated here, the only part we
      really have to get gritty with vite.  */
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
      /* Generate our own config here, and run setup functions. This is the
      first instance where we call plugin specific code beyond config stuff */
      configResolved: async (vite) => {
        /* We want to set our SSR build inputs to just our input file.
        This way we aren't building client entries for the server build if
        the user happens to provide manual rollup inputs. */
        if (vite.build.ssr) {
          vite.build.rollupOptions.input = {
            [adaptor.entryName ?? "index"]: adaptor.runtime,
          };
        }

        /* generate the config used for the rest of the plugin.
        This will be accessible everywhere beyond this point. */
        c = generateConfig(userConfig, {
          root: vite.root,
          mode: vite.command ?? "dev",
          ssr: !!vite.build?.ssr,
          adaptor,
          vfs,
        });

        /* create our server entry.
        This is what adaptors import. */
        await build.createVirtualServerEntry({
          root: c.root,
          serverDir: c.server.directory,
          serverEntry: c.server.entry,
          vfs,
        });

        /* create virtual files for #vono/template and #vono/manifest */
        createMetadata({
          builtHtmlPath: join(c.root, c.adaptor.publicDir, "index.html"),
          isBuild: (vite.command === "build"),
          manifestPath: join(
            c.root,
            c.adaptor.publicDir,
            ".vite",
            "manifest.json",
          ),
          root: c.root,
          transformHtml: (p, r) => devServer.transformIndexHtml(p, r),
          vfs,
        });

        await fs.mkdir("node_modules/.vono", { recursive: true })

        /* lets write our entry and type to temporary files. */
        await fs.writeFile(
          "node_modules/.vono/entry.ts",
          `import App from "${
            join(c.root, c.server.directory, c.server.entry)
          }; export default App; export type AppType = typeof App;`,
        );

        await writeTypes();

        /* create virtual RPC files */
        buildRPC({ vfs })
      },
      /* This is where we run our dev server setup. */
      configureServer: (
        server,
      ) => (devServer = server, registerDevServer(server, c)),
      /* Need to recreate our server instance when it's modified. */
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
      /* This is where we run our post build stuff */
      writeBundle: async (x) => {
        if (!c.ssr) return;
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
