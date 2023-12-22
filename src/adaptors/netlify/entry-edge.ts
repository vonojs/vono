// @ts-ignore - deno import
import { Hono as Server } from "https://deno.land/x/hono/mod.ts";
// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const server = new Server();
server.route("/", entry);
// @ts-ignore - deno import
export default async (req, context) => {
  const res = await server.fetch(req, { context })
  if(!res.ok) return undefined;
  return res;
}

export const config = {
  path: "/*",
}