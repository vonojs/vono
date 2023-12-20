import { EncodingOption } from "fs";
import * as fs from "fs/promises";
import * as pathe from "pathe";

export const exists = async (path: string) => {
	try {
		await fs.access(path);
	} catch {
		return false;
	}
	return true;
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