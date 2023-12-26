import * as vite from "vite";
import { type Config } from "./config";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import { exists } from "./tools";
import { runtimeDir } from "./runtime";
import { log } from ".";
import { VFile } from "./plugins/vfs";

declare global {
  var IS_BUILDING_SERVER: boolean;
  var SERVER_BUILT: boolean;
}

export async function createVirtualServerEntry(args: {
  root: string;
  serverDir: string;
  serverEntry: string;
  vfs: Map<string, VFile>;
}) {
  let path: string;
  if (
    await exists(
      pathe.join(args.root, args.serverDir, args.serverEntry),
      ".tsx",
      ".ts",
      ".js",
      ".jsx"
    )
  ) {
    path = pathe.join(
      args.root,
      args.serverDir,
      args.serverEntry,
    );
  } else {
    globalThis.IS_BUILDING_SERVER && log.info(
      `No server entry found in ${args.serverDir}/${args.serverEntry}, using virtual entry.`,
    );
    path = pathe.join(runtimeDir, "dev-server.ts");
  }
  args.vfs.set("/internal/server.entry", {
    path: "/internal/server.entry",
    content: async () => `import app from '${path}'; export default app;`,
  });
}

export async function buildServer(config: Config) {
  if (globalThis.IS_BUILDING_SERVER) return;
  globalThis.IS_BUILDING_SERVER = true;
  await vite.build({
    plugins: [
      {
        name: "server-entry",
        configResolved(vite) {
          vite.build.outDir = config.adaptor.serverDir;
        },
      }
    ],
    ssr: {
      noExternal: true,
      external: config.adaptor.env?.external,
    },
    resolve: {
      alias: config.adaptor.env?.alias,
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "[name].[hash].[format].js",
          inlineDynamicImports: config.adaptor.inlineDynamicImports,
        },
        input: {
          [config.adaptor.entryName ?? "index"]: config.adaptor.runtime,
        },
        external: config.adaptor.env?.external,
      },
    },
  });
  globalThis.SERVER_BUILT = true;
}

export async function writeArtifacts(config: Config) {
  await fs.copyFile(
    pathe.join(config.root, config.adaptor.publicDir, "manifest.json"),
    pathe.join(config.root, config.adaptor.serverDir, "manifest.client.json"),
  );
  await fs.writeFile(
    pathe.join(config.adaptor.outDir, "build.json"),
    JSON.stringify({
      server: pathe.join(
        config.adaptor.serverDir,
        config.adaptor.entryName + ".js",
      ),
    }),
  );
}
