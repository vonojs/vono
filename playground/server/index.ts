import { Server, redirect } from "../../src/runtime/server";

const app = new Server();

app.get("/ping", c => ({ hello: "pong" }));
app.get("/dyn", async (c) => {
  const { dyn } = await import("../dynamic");
  return ({ dyn });
})

app.get("/throw", () => {
  throw new Error("test");
})

app.get("/redir", () => {
  throw redirect("/ping");
})

export default app;
