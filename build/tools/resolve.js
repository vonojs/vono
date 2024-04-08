import { existsSync } from "fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
export function resolveExt(path, ext = [".ts", ".js", ".tsx", ".jsx"]) {
  for (const e of ext) {
    if (existsSync(path + e))
      return path + e;
  }
  return null;
}
export function resolveModuleDirectory(path) {
  return dirname(fileURLToPath(path));
}
export function slash(path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }
  return path.replace(/\\/g, "/");
}
export function stripExt(path) {
  return path.replace(/\.[^/.]+$/, "");
}
