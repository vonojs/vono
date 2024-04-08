import { Adaptor } from "../../adaptor";
import { resolveModuleDirectory } from "../../tools/resolve";
import { join } from "node:path";

const dir = resolveModuleDirectory(import.meta.url);

export default class Netlify extends Adaptor {
	name = "netlify";
	outputDirectory = "dist/netlify/functions";

	edge: boolean;

	constructor(config: { edge?: boolean } = {}) {
		super();

		this.edge = config.edge ?? false;
		if (this.edge) {
			this.productionRuntime = join(dir, "runtime.edge.prod");
		}
	}

	developmentRuntime = join(dir, "runtime.dev");
	productionRuntime = join(dir, "runtime.prod");
}
