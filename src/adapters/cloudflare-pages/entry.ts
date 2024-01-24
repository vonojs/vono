import { Hono } from "hono";
// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry";

const server = new Hono();

server.use("*", async (c, next) => {
  if (c.req.method !== "GET") return await next();
  const a = await (c.env?.ASSETS as any).fetch(c.req.raw);
  if (a.ok) return a;
  return await next();
});

server.route("/", entry);

export default server;
