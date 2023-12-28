import { Hono } from "hono";

const app = new Hono()
.get("/ping", (c) => c.json({ message: "ponger" }))

.get("/throw", () => {
	throw new Error("test");
})

.get("/*", (c) => {
	return c.text(`renderer: ${c.req.url}`)
})

export default app;
