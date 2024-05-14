import { Adaptor } from "../index";
import { resolveModuleDirectory } from "../../tools";
import { join } from "node:path";

const dir = resolveModuleDirectory(import.meta.url);

export class NodeAdaptor extends Adaptor {
	name = "node";

	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");
}
