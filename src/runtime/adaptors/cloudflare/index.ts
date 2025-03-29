import type { Adaptor, VonoContext } from "../../../mod.ts";
import type { PluginConfig } from "@cloudflare/vite-plugin"
import { createLogger, LogLevel, gradients } from "elysiatech/logging"

let logger = createLogger({
	name: "AdaptorCloudflare",
	level: LogLevel.Info,
	color: gradients.orange,
})

type CloudflareAdaptorConfig = Omit<PluginConfig, "viteEnvironment">;

export class CloudflareAdaptor implements Adaptor {
	name = "cloudflare"

	serverDevEntry = "";

	serverProdEntry = "";

	constructor(
		public config: CloudflareAdaptorConfig = {}
	) {}

	clientBuildStart() {
		logger.info(`Building client`);
	}

	clientBuildEnd() {
		logger.success(`Client build complete`);
	}

	serverBuildStart(context: VonoContext) {
		logger.info(`Building server entry:`, context.serverEntry);
	}

	serverBuildEnd() {
		setTimeout(() => {
			logger.success(`Server build complete`);
		}, 50)
	}
}