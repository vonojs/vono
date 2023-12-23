import { Adaptor } from "../index";
import { nodeless } from "unenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as fs from "fs/promises";

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
		// inlineDynamicImports: true,
		env: nodeless,
		onBuild: async () => {
			await fs.writeFile("cloudflare/wrangler.toml", `
name = "${options.name || "gaiiaa-vite-cloudflare"}"
main = "server/index.js"
assets = "public"
no-bundle = "true"
compatibility_date = "2022-07-12"
`.trim())
		}
	});
