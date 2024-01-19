import { serveStatic } from "hono/bun";
import { Hono } from "hono";
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

let exp;

// @ts-ignore - bun feature
if (import.meta.main) {
  const port = parseInt(process.argv[2]) || 8000;
  console.log(`Listening on port http://localhost:${port}`);
  exp = {
    port,
    fetch: server.fetch,
  };
} else {
  exp = server;
}

export default exp;
export const prerenderHandler = server.fetch;
