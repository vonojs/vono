import { InternalConfig } from "./config";
import * as vite from "vite";
import { notfound, Server } from "./runtime/server";
import { handleNodeRequest } from "./tools/node-hono";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import { runtimeDir } from "./runtime";
import { invariant } from "./tools/invariant";

export function registerDevServer(
  server: vite.ViteDevServer,
  config: InternalConfig,
) {
  return async () => {
    await createDevServer(config, server);
    
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith("/@id/")) {
        return next();
      }
      invariant(config.devServer, "No dev server found. This is a bug.");
      handleNodeRequest(config.devServer, req, res);
    });
  }
}

export async function createDevServer(
  config: InternalConfig,
  server: vite.ViteDevServer,
) {
  config.devServer = new Server();
  /* load the entry */
  let entry;
  try {
    entry = await server.ssrLoadModule(
      pathe.join(config.root, config.server.directory, config.server.entry),
    );
  } catch (e) {
    entry = await server.ssrLoadModule(
      pathe.join(runtimeDir, "dev-server"),
    );
  }
  if (!entry) {
    throw new Error("No entry found");
  }
  invariant(entry.default, "Could not find a server entry. This is a");
  config.devServer.route("/", entry.default);
  // server fallback to index.html
  config.devServer.get("*", async (c) => {
    const raw = await fs.readFile(
      pathe.join(config.root!, "index.html"),
      "utf-8",
    );
    if (!raw) {
      throw notfound();
    }
    return new Response(await server.transformIndexHtml(c.url, raw), {
      headers: {
        "content-type": "text/html",
      },
    });
  });
}
