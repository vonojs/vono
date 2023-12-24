import { Adaptor } from "../index";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as fs from "fs/promises";

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
  external: cloudflareNodeCompatModules.map((p) => `node:${p}`),
};

export default (options: {
	name?: string;
} = {}) => 
	Adaptor({
		name: "cloudflare",
		runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
		outDir: "cloudflare/",
		serverDir: "cloudflare/server",
		publicDir: "cloudflare/public",
		entryName: "index",
		env: cloudflare,
		onBuild: async () => {
			await fs.writeFile("cloudflare/wrangler.toml", `
name = "${options.name || "gaiiaa-vite-cloudflare"}"
main = "server/index.js"
assets = "public"
node_compat = true
compatibility_date = "2022-07-12"
`.trim())
		}
	});
