import * as fs from "fs/promises";
import * as pathe from "pathe";
import { fileURLToPath } from "url";

export const exists = async (path: string, ...extensions: string[]) => {
  if (!extensions.length) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  } else {
		for (const ext of extensions) {
			try {
				await fs.access(path + ext);
				return path + ext;
			} catch {}
		}
		return false;
	}
};

export const stripExtension = (path: string) =>
  path.slice(0, path.lastIndexOf("."));

const ensureDirectory = async (path: string) => {
  await fs.mkdir(path, { recursive: true });
};

export const write = async (path: string, content: string) => {
  await ensureDirectory(pathe.dirname(path));
  await fs.writeFile(path, content);
};

export const writeDev = async (path: string, content: string) => {
  return write(pathe.join("node_modules/.vite-plugin-backend", path), content);
};

export const readTextFile = (path: string) => {
  try {
    return fs.readFile(path, "utf-8");
  } catch {
    return null;
  }
};

export const thisDir = (path: string) => pathe.dirname(fileURLToPath(path));
