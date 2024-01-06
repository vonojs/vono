import { ViteDevServer } from "vite";
import { Vono } from "../config";
import { join } from "path";
import { runtimeDir } from "../runtime";
import { readFile } from "fs/promises";
import { Hono } from "hono";

export async function createDevServer(args: {
  server: ViteDevServer;
  vono: Vono;
}) {
  args.vono.devServer = new Hono();
  const entry = await args.server.ssrLoadModule(join(runtimeDir, "dev-server"));
  args.vono.devServer?.get("/", async (c, next) => {
    try {
      const raw = await readFile(join(args.vono.root!, "index.html"), "utf-8");
      return c.html(await args.server.transformIndexHtml(c.req.url, raw));
    } catch {
      await next();
    }
  });
  args.vono.devServer?.route("/", entry.default);
  args.vono.devServer?.get("*", async (c) => {
    try {
      const raw = await readFile(join(args.vono.root!, "index.html"), "utf-8");
      return c.html(await args.server.transformIndexHtml(c.req.url, raw));
    } catch {
      return c.text("No index.html or catchall", { status: 404 });
    }
  });
}
