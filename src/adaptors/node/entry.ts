import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry";

const port = parseInt(process.argv[2]) || 8000;

const server = new Hono();
server.use(
  "*",
  serveStatic({
    root: "./public",
  }),
);

server.route("/", entry);

console.log(`Listening on port http://localhost:${port}`);

serve({
  fetch: server.fetch,
  port,
});

export default server;
