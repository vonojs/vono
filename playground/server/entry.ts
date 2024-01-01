import { Hono } from "hono";
import manifest from "#manifest"

console.log(manifest, reactRefresh, devScripts)

const app = new Hono()
.get("/ping", (c) => c.json({ message: "ponger" }))

.get("/throw", () => {
	throw new Error("test");
})

.get("*", async (c, next) => {
	return c.text(`renderer: ${c.req.url}`)
})

export default app;
