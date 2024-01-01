import { Hono } from "hono";

const hono = new Hono();

hono.get("/message", (c) => c.json({ message: "Hello World!" }));

export default hono;