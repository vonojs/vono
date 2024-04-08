import { Adaptor } from "../../adaptor";
import { resolveModuleDirectory } from "../../tools/resolve";
import { join } from "node:path";

const dir = resolveModuleDirectory(import.meta.url);

export default class Node extends Adaptor {
	name = "node";

	developmentRuntime = join(dir, "runtime.dev.ts");
	productionRuntime = join(dir, "runtime.prod.ts");
}
