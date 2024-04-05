import { existsSync } from "fs";

export function resolveExt(path: string, ext: string[] = [".ts", ".js", ".tsx", ".jsx"]): string | null {
	for (const e of ext) {
		if (existsSync(path + e)) return path + e;
	}
	return null;
}