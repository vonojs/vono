import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Adapter } from "../index";

const cloudflareNodeCompatModules = [
  "assert",
  "async_hooks",
  "buffer",
  "crypto",
  "diagnostics_channel",
  "events",
  "path",
  "process",
  "stream",
  "string_decoder",
  "util",
];

const cloudflare = {
  alias: {
    ...Object.fromEntries(
      cloudflareNodeCompatModules.map((p) => [p, `node:${p}`]),
    ),
    ...Object.fromEntries(
      cloudflareNodeCompatModules.map((p) => [`node:${p}`, `node:${p}`]),
    ),
  },
  inject: {},
  polyfill: [],
  external: [...cloudflareNodeCompatModules.map((p) => `node:${p}`)],
};

export default () =>
  Adapter({
    name: "cloudflare-pages",
    runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
    outDir: "dist",
    serverDir: "dist",
    publicDir: "dist",
    entryName: "_worker",
    env: cloudflare,
  });
