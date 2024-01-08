import { Hono } from "hono";
// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry";

const server = new Hono();

server.route("/", entry);

server.use("*", (c) => {
  return (c.env?.ASSETS as any).fetch(c.req.raw);
});

export default server;
