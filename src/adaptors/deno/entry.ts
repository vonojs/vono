// @ts-ignore - deno import
import { Hono } from "https://deno.land/x/hono/mod.ts";
// @ts-ignore - deno import
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";

// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry";

const server = new Hono();
server.use(
  "*",
  serveStatic({
    root: "./public",
  }),
);
server.route("/", entry);

// @ts-ignore - deno namespace
Deno.serve(server.fetch);

export default server;
