import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";
import type { Environment } from "vite";
import fs from "fs/promises";
import { createLogger, gradients, LogLevel } from "elysiatech/logging";

export let isVonoEnvironment = (e: Environment) => e.name === "vono"

export let isSsrEnvironment = (e: Environment) => e.name === "ssr"

export let isClientEnvironment = (e: Environment) => e.name === "client"

export let resolveThisDir = (path: string): string =>
	dirname(fileURLToPath(path));

export let resolveUnknownExtension = (
	path: string | undefined | null,
	ext: string[] = [".ts", ".js", ".tsx", ".jsx"],
): string | null => {
	if (!path) return null;
	if (ext.some((e) => path.endsWith(e))) return path;
	for (const e of ext) {
		if (existsSync(path + e)) return path + e;
	}
	return null;
}

export let fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

export let logger = createLogger({
	name: "VONO",
	level: LogLevel.Info,
	color: gradients.sunset,
})