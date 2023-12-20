import * as vite from "vite";
import { InlineConfig, generateConfig, configPlugin } from "./config";
import { createLogger } from "@gaiiaa/logger";
import { vfsPlugin } from "./vfs";
import { serverPlugin } from "./server";
import { PLUGIN_NAME } from "./constants";

export const log = createLogger({
	name: PLUGIN_NAME,
	level: 0,
});

export default function plugin(config?: InlineConfig): vite.Plugin[] {

	const cfg = generateConfig(config || {});
	log.setLevel(cfg.debug ? 0 : 1);

	return [
		configPlugin(cfg),
		vfsPlugin(cfg),
		serverPlugin(cfg),
	];
}



