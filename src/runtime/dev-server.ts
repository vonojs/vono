import Server from "./server";

const app = new Server();

// add actions handlers here

// add FS router here

app.get("/_dev", () => {
  return "Dev tools!!";
});

export default app;