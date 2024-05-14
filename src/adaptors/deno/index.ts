import { Adaptor } from "../../adaptor";
import { resolveModuleDirectory } from "../../tools/resolve";
import { join } from "node:path";

const dir = resolveModuleDirectory(import.meta.url);

export default class DenoAdaptor extends Adaptor {
	name = "deno";

	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");
}
