import { Hono } from "hono"
// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const server = new Hono();
server.route("/", entry);

export default server;