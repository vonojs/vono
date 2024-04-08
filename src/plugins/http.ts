import { Plugin } from "vite";
import path from "path";

export type ResolveIdFallback = (
	specifier: string,
	importer?: string,
) => string | void;

function isHttpProtocol(id: string | undefined | null) {
	return id?.startsWith("http://") || id?.startsWith("https://");
}

const cache = new Map();

export function httpPlugin(): Plugin {
	return {
		name: "vono:http",
		enforce: "pre",
		async resolveId(id, importer) {
			if (importer && isHttpProtocol(importer)) {
				if (id.startsWith("https://")) {
					return id;
				}
				const { pathname, protocol, host } = new URL(importer);
				// for skypack
				if (id.startsWith("/")) {
					return `${protocol}//${host}${id}`;
				} else if (id.startsWith(".")) {
					const resolvedPathname = path.join(path.dirname(pathname), id);
					const newId = `${protocol}//${host}${resolvedPathname}`;
					return newId;
				}
			} else if (isHttpProtocol(id)) {
				return id;
			}
		},
		async load(id) {
			if (id === null) {
				return;
			}
			if (isHttpProtocol(id)) {
				const cached = cache.get(id);
				if (cached) {
					return cached;
				}
				const res = await fetch(id);
				if (!res.ok) {
					throw res.statusText;
				}
				const code = await res.text();
				cache.set(id, code);
				return code;
			}
		},
	};
}
