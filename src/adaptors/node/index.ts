import { Adaptor } from "../../mod";
import { resolveModuleDirectory } from "../../tools";
import { join } from "node:path";

const dir = resolveModuleDirectory(import.meta.url);

export default class Node extends Adaptor {
	name = "node";

	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");
}
