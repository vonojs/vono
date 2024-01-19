// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry";
import { Hono } from "hono";

const app = new Hono();

app.route("/", entry);

app.get("/__dev", (c) => {
  return c.json({
    routes: app.routes,
    env: process.env,
  })
})

export default app;
