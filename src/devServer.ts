import { Config } from "./config";
import * as vite from "vite";
import { Hono } from "hono";
import { handleNodeRequest } from "./tools/node-hono";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import { runtimeDir } from "./runtime";
import { assert, check } from "@gaiiaa/assert";

export function registerDevServer(
  server: vite.ViteDevServer,
  config: Config,
) {
  return async () => {
    await createDevServer(config, server);
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith("/@id/")) {
        return next();
      }
      if(check(config.devServer)){
        handleNodeRequest(config.devServer, req, res);
      } else {
        throw new Error("No dev server found. This is a bug.");
      }
    });
  }
}

export async function createDevServer(
  config: Config,
  server: vite.ViteDevServer,
) {
  config.devServer = new Hono();
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
  assert(entry.default)
  config.devServer.route("/", entry.default);
  /* Serve fallback html.
  If this doesn't exist, we serve a warning. */
  config.devServer.get("*", async (c) => {
    const raw = await fs.readFile(
      pathe.join(config.root!, "index.html"),
      "utf-8",
    );
    if (!raw) {
      return new Response("No index.html found.")
    }
    return new Response(await server.transformIndexHtml(c.req.url, raw), {
      headers: {
        "content-type": "text/html",
      },
    });
  });
}
