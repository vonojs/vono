import { dirname, join } from "path";
import { createAdapter } from "../index";
import { node } from "unenv";
import { fileURLToPath } from "url";

export default () =>
  createAdapter({
    name: "bun",
    runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
    outDir: "dist/",
    serverDir: "dist",
    publicDir: "dist/public",
    entryName: "entry",
    env: node,
  });
