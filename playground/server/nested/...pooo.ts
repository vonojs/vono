import { defineHandler } from "../../../src/handler"

export default defineHandler(async (c) => {
  return {
    "nested": "poo"
  }
});