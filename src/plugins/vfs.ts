import * as vite from "vite";
const PLUGIN_NAME = "vpb";

type ContentFn = (path: string) => string | Promise<string>;

export type VFile = {
	path: string;
	content?: ContentFn;
	serverContent?: ContentFn;
	clientContent?: ContentFn;
};

export function createVFS(): {
	add: (vfile: VFile) => VFile;
	remove: (path: string) => void;
	get: (path: string) => VFile | undefined;
	internal: Map<string, VFile>;
} {
	const vfs = new Map<string, VFile>();
	const add = (vfile: VFile) => (vfs.set(vfile.path, vfile), vfile);
	const remove = (path: string) => vfs.delete(path);
	const get = (path: string) => vfs.get(path);
	return {
		internal: vfs,
		add,
		remove,
		get,
	};
}

export type VFS = ReturnType<typeof createVFS>;

export function createVFile<
	C extends ContentFn | undefined,
	SC extends ContentFn | undefined,
	CC extends ContentFn | undefined,
>(vfile: {
	path: string;
	content?: C;
	serverContent?: SC;
	clientContent?: CC;
}) {
	return vfile as {
		path: string;
		content: C;
		serverContent: SC;
		clientContent: CC;
	} satisfies VFile;
}

function find(vfs: Set<VFile>, path: string) {
	for (const file of vfs) {
		if (file.path === path) return file;
	}
}

export function vfsPlugin(store?: Map<string, VFile>): vite.Plugin {
	const vfsAlias = "#server";
	const virtualModuleId = "virtual:server:";
	const vfs = store ?? new Map<string, VFile>();
	return {
		name: `${PLUGIN_NAME}:vfs`,
		enforce: "pre",
		config: () => {
			return {
				resolve: {
					alias: {
						[vfsAlias]: virtualModuleId,
					}
				}
			}
		},
		resolveId(id) {
			if (id.startsWith(virtualModuleId)) {
				return "\0" + id;
			}
		},
		async load(id, ctx) {
			if (id.startsWith("\0" + virtualModuleId)) {
				const path = id.replace("\0" + virtualModuleId, "");
				const file = vfs.get(path);
				if (!file) return null;
				const content = ctx?.ssr ? file.serverContent : file.clientContent;
				const c = await (content ?? file.content)?.(path);
				return c;
			}
		},
		handleHotUpdate(ctx) {
			
		},
	};
}