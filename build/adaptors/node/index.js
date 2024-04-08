import { Adaptor } from "../../adaptor.js";
import { resolveModuleDirectory } from "../../tools/resolve.js";
import { join } from "node:path";
const dir = resolveModuleDirectory(import.meta.url);
export default class Node extends Adaptor {
  name = "node";
  developmentRuntime = join(dir, "runtime.dev.ts");
  productionRuntime = join(dir, "runtime.prod.ts");
}
