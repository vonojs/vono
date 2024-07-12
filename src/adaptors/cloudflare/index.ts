import { Adaptor } from "../index.ts";
import { resolveModuleDirectory } from "../../tools.ts";
import { join } from "node:path";
import * as fs from "node:fs/promises";

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

export class CloudflareAdaptor extends Adaptor {
	name = "cloudflare";
	entryName = "_worker";

	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");

	inlineDynamicImports = true;
	external = [...cloudflareNodeCompatModules.map((p) => `node:${p}`)];
	alias = {
		...Object.fromEntries(
			cloudflareNodeCompatModules.map((p) => [p, `node:${p}`]),
		),
		...Object.fromEntries(
			cloudflareNodeCompatModules.map((p) => [`node:${p}`, `node:${p}`]),
		),
	};

	buildEnd = async () => {
		await fs.cp("dist/client", "dist", { recursive: true });
		await fs.rm("dist/client", { recursive: true });
	};
}
