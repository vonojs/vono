import { existsSync } from "fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export function resolveUnknownExtension(
	path: string | undefined | null,
	ext: string[] = [".ts", ".js", ".tsx", ".jsx"],
): string | null {
	if (!path) return null;
	if (ext.some((e) => path.endsWith(e))) return path;
	for (const e of ext) {
		if (existsSync(path + e)) return path + e;
	}
	return null;
}

export function resolveModuleDirectory(path: string) {
	return dirname(fileURLToPath(path));
}

export function slash(path: string): string {
	const isExtendedLengthPath = /^\\\\\?\\/.test(path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
	if (isExtendedLengthPath || hasNonAscii) {
		return path;
	}
	return path.replace(/\\/g, "/");
}

export function stripExt(path: string): string {
	return path.replace(/\.[^/.]+$/, "");
}

export function stripLeadingSlash(str: string) {
	return str.replace(/^\//, "");
}
