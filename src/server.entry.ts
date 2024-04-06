import {EnvironmentContext} from "../vono/ctx.ts";
import handler from "./handler.ts";

import manifest from "#vono/manifest"
console.log("Manifest:", manifest);

console.log("Environment Context:", EnvironmentContext.getStore());

export default handler;

