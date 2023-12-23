import { dirname, join } from "path";
import { Adaptor } from "../index";
import { node } from "unenv"
import { fileURLToPath } from "url";

export default () => Adaptor({
  name: "node",
  runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
  outDir: "dist/",
  serverDir: "dist/server",
  publicDir: "dist/public",
  entryName: "index",
  env: node,
});