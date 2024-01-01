// @ts-ignore - this is a generated file
import entry from "#vono/internal/server.entry"
import { Hono } from "hono";

const app = new Hono();

app.route("/", entry);

export default app;