import { Plugin } from "vite";

export function httpPlugin(): Plugin {
	return {
		name: "vono:env",
		enforce: "pre",
	};
}
