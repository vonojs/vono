import { Adaptor } from "../../adaptor";
import { resolveModuleDirectory } from "../../tools/resolve";
import { join } from "node:path";
import * as fs from "fs/promises";

// thanks unenv!
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

const dir = resolveModuleDirectory(import.meta.url);

export default class Cloudflare extends Adaptor {
	name = "cloudflare";
	entryName = "_worker";


	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");

	inlineDynamicImports = true;
	external = [...cloudflareNodeCompatModules.map((p) => `node:${p}`)]
	alias = {
		...Object.fromEntries(
			cloudflareNodeCompatModules.map((p) => [p, `node:${p}`]),
		),
		...Object.fromEntries(
			cloudflareNodeCompatModules.map((p) => [`node:${p}`, `node:${p}`]),
		),
	};

	buildEnd = async () => {
		await fs.copyFile("dist/_worker.js", "dist/client/_worker.js")
		await fs.rm("dist/_worker.js")
	};
}
