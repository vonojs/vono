import { serve } from "@hono/node-server"
import { Hono } from "hono";
// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry"

const port = parseInt(process.argv[2]) || 8000;

const server = new Hono();
server.route("/", entry);

serve({
	fetch: server.fetch,
	port,
});