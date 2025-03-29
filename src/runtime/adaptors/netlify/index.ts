import type { Adaptor, VonoContext } from "../../../mod.ts";
import type { Manifest, ResolvedConfig } from "vite";
import * as path from "node:path";
import * as fs from "fs/promises";
import { resolveThisDir } from "../../../util.ts";
import { createLogger, LogLevel, gradients } from "elysiatech/logging"

let logger = createLogger({
	name: "AdaptorNetlify",
	level: LogLevel.Info,
	color: gradients.blue,
})

let dir = resolveThisDir(import.meta.url);

let config = `
export const config = {
  path: "/*",
  preferStatic: true
};`

export class NetlifyAdaptor implements Adaptor {
	name = "netlify"

	serverDevEntry = path.join(dir, "dev.ts");
	serverProdEntry = path.join(dir, "prod.ts");

	async serverBuildEnd(
		context: VonoContext,
		viteConfig: ResolvedConfig,
		manifest: Manifest
	): Promise<void> {
		console.log("\t")
		setTimeout(async () => {
			logger.info("Copying server files to .netlify/v1/functions");

			await fs.rm(
				".netlify/v1/functions",
				{ recursive: true, force: true }
			);

			await fs.cp(
				"dist-server",
				".netlify/v1/functions/",
				{ recursive: true }
			);

			await fs.appendFile(
				".netlify/v1/functions/entry.js",
				config
			);

			logger.success(
				"Built for Netlify successfully",
				"Your server is now available at",
				"`.netlify/v1/functions/entry.js`",
			)
		}, 10)
	}

	clientBuildStart() {
		logger.info(`Building client`);
	}

	clientBuildEnd() {
		logger.success(`Client build complete`);
	}

	serverBuildStart(context: VonoContext) {
		logger.info(`Building server entry:`, context.serverEntry);
	}
}