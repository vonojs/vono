import { dirname, join } from "path";
import { Adaptor } from "../index";
import { node } from "unenv";
import { fileURLToPath } from "url";

export default () =>
  Adaptor({
    name: "node",
    runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
    outDir: "dist/",
    serverDir: "dist",
    publicDir: "dist/public",
    entryName: "entry",
    env: node,
  });
