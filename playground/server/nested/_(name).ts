import { defineHandler } from "../../../src/handler"

export default defineHandler(async (c) => {
  return {
    "param": c.req.param("name")
  }
});