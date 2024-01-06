import { Adapter } from "../index";
import { fileURLToPath } from "url";
import { basename, dirname, join } from "path";
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
	Adapter({
		name: "cloudflare",
		runtime: join(dirname(fileURLToPath(import.meta.url)), "entry"),
		outDir: "cloudflare/",
		serverDir: "cloudflare/server",
		publicDir: "cloudflare/public",
		entryName: "entry",
		env: cloudflare,
		onBuild: async () => {
      const name = options.name || basename(process.cwd()) + "-vono";
			await fs.writeFile("cloudflare/wrangler.toml", `
name = "${name || "gaiiaa-vite-cloudflare"}"
main = "server/entry.js"
assets = "public"
node_compat = true
compatibility_date = "2022-07-12"
`.trim())
		}
	});
