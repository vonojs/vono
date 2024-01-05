import { dirname, join } from "path";
import { Adapter } from "../index";
import { nodeless } from "unenv";
import { fileURLToPath } from "url";

export default (options: { edge?: boolean } = {}) => {
  const name = options.edge ? "netlify-edge" : "netlify";
  const runtime = options.edge ? "entry-edge" : "entry";
	const serverDir = options.edge ? "netlify/edge-functions" : "netlify/functions/entry";
	return Adapter({
		name,
		runtime: join(dirname(fileURLToPath(import.meta.url)), runtime),
		outDir: "netlify/",
		serverDir: serverDir,
		publicDir: "netlify/public",
		inlineDynamicImports: options.edge,
		entryName: "entry",
		env: nodeless,
	});
};
