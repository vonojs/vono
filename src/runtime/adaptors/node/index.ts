import type { Adaptor, VonoContext } from "../../../mod.ts";
import * as path from "node:path";
import { resolveThisDir } from "../../../util.ts";
import { createLogger, LogLevel, gradients } from "elysiatech/logging"

let logger = createLogger({
	name: "AdaptorNode",
	level: LogLevel.Info,
	color: gradients.blue,
})

let dir = resolveThisDir(import.meta.url);

export class NodeAdaptor implements Adaptor {
	name = "node"

	serverDevEntry = path.join(dir, "dev");
	serverProdEntry = path.join(dir, "prod");

	clientBuildStart() {
		logger.info(`Building client`);
	}

	clientBuildEnd() {
		logger.success(`Client build complete`);
	}

	serverBuildStart(context: VonoContext) {
		logger.info(`Building server entry:`, context.serverEntry);
	}

	serverBuildEnd(context: VonoContext) {
		setTimeout(() => {
			logger.success(`Server build complete`);
			logger.info(
				`You can now run your server with:`,
				`\`node dist-server/entry\``,
			)
		}, 50)
	}
}