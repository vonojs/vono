import { Hono } from "hono";

const hono = new Hono()

  .get("/api/ping", (c) => c.text("pong"))
  .get("/api/about", async (c) => {
    await new Promise((r) => setTimeout(r, 2000));
    return c.json({ name: "vono", version: "beta" });
  });

hono.get("/*", async (c) => {
  const render = await import("./renderer").then((m) => m.default);
  return c.html(await render(new URL(c.req.url).pathname));
});

export default hono;
