import { Plugin } from "vite";
import path from "path";
import { log } from ".";

export type ResolveIdFallback = (
	specifier: string,
	importer?: string
) => string | void;

function isHttpProtocol(id: string | undefined | null) {
	return id?.startsWith("http://") || id?.startsWith("https://");
}

const cache = new Map();

export function httpPlugin(): Plugin {
	return {
		name: "http-plugin",
    enforce: "pre",
		async resolveId(id, importer) {
			log.debug(`resolveId: ${id} from ${importer}`);
			if (importer && isHttpProtocol(importer)) {
        log.debug(`resolveId-http: ${id} from ${importer}`);
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
				log.debug(`resolveId-http: ${id}`);
				return id;
			}
		},
		async load(id) {
			if (id === null) {
				return;
			}
			log.debug(`load: ${id}`);
			if (isHttpProtocol(id)) {
        log.debug(`load-http: ${id}`);
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
