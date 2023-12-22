// @ts-ignore - deno import
import { Hono as Server } from "https://deno.land/x/hono/mod.ts";
// @ts-ignore - deno import
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'

// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const server = new Server();
server.use("*",
  serveStatic({
    root: "./public",
  })
);
server.route("/", entry);

// @ts-ignore - deno namespace
Deno.serve(server.fetch)