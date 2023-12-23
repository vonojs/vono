import { serve } from "@hono/node-server"
import { Server } from "../../runtime/server";
// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const port = parseInt(process.argv[2]) || 8000;

const server = new Server();
server.route("/", entry);

serve({
	fetch: server.fetch,
	port,
});