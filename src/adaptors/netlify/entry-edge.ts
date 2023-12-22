// @ts-ignore - deno import
import { Hono as Server } from "https://deno.land/x/hono/mod.ts";
// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const server = new Server();
server.route("/", entry);

export default server.fetch

export const config = {
  path: "*"
}