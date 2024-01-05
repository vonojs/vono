import { Hono } from "hono";

const hono = new Hono();

hono.get("/ping", (c) => c.text("pong"));

export default hono;
