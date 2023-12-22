import { Server } from "../src/server";

import { z } from "https://esm.sh/zod"
console.log(z)

const app = new Server();

app.get("/ping", c => c.json({ hello: "pong" }));
app.get("/dyn", async (c) => {
  const { dyn } = await import("./dynamic");
  return c.json({ dyn });
})

export default app;
