import { dirname, join } from "path";
import { Adaptor } from "../index";
import { nodeless } from "unenv";
import { fileURLToPath } from "url";
import * as fs from "fs/promises"

const tmpl = `[build]
publish = "netlify/public"
edge_functions = "netlify/edge-functions"

[functions]
directory = "netlify/functions"`

export default (options: { edge?: boolean } = {}) => {
  const name = options.edge ? "netlify-edge" : "netlify";
  const runtime = options.edge ? "entry-edge" : "entry";
	const serverDir = options.edge ? "netlify/edge-functions" : "netlify/functions/entry";
	return Adaptor({
		name,
		runtime: join(dirname(fileURLToPath(import.meta.url)), runtime),
		outDir: "netlify/",
		serverDir: serverDir,
		publicDir: "netlify/public",
		inlineDynamicImports: options.edge,
		entryName: "entry",
		env: nodeless,
		onBuild: async () => {
			await fs.writeFile("netlify.toml", tmpl)
		}
	});
};
