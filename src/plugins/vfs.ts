import * as vite from "vite";
import { VFS } from "../vfs";

export default function vfsPlugin(
	options: { vfs?: VFS; alias?: string } = {},
): vite.Plugin {
	const vfsAlias = options.alias ?? "#vfs";
	const virtualModuleId = "virtual:vfs:";
	const vfs = options.vfs ?? new VFS();
	return {
		name: "vono:vfs",
		enforce: "pre",
		config: () => {
			return {
				resolve: {
					alias: {
						[vfsAlias]: virtualModuleId,
					},
				},
			};
		},
		resolveId(id) {
			if (id.startsWith(virtualModuleId)) {
				return "\0" + id;
			}
		},
		async load(id, ctx) {
			if (id.startsWith("\0" + virtualModuleId)) {
				let path = id.replace("\0" + virtualModuleId, "");
				const url = new URL(path, "http://localhost");
				const params: Record<string, string[]> = {};
				for (const [key, value] of url.searchParams.entries()) {
					params[key] = value.split(",");
				}
				path = url.pathname;
				const file = vfs.get(path);
				if (!file) return null;
				const stringOrFn = ctx?.ssr ? file.serverContent : file.clientContent;
				const content = await (stringOrFn ?? file.content)?.(params);
				return content;
			}
		},
		handleHotUpdate(ctx) {
			// invalidate all files in the virtual module
			// todo: only invalidate the changed file
			for (const path of vfs.store.keys()) {
				const mod = ctx.server.moduleGraph.getModuleById(
					"\0" + virtualModuleId + path,
				);
				mod && ctx.server.reloadModule(mod);
			}
		},
	};
}
