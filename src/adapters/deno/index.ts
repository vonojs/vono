import { dirname, join } from "path";
import { Adapter } from "../index";
import { nodeless } from "unenv";
import { fileURLToPath } from "url";

export default () =>
  Adapter({
    name: "deno",
    runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
    outDir: "dist/",
    serverDir: "dist",
    publicDir: "dist/public",
    env: nodeless,
    entryName: "entry",
  });
