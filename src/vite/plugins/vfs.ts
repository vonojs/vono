import * as vite from "vite";

export class VFS {
  store = new Map<string, VFile>();
  constructor(options: {
    store?: Map<string, VFile>;
  } = {}) {
    if (options.store) this.store = options.store;
  }
	add<
  C extends ContentFn | undefined,
  SC extends ContentFn | undefined,
  CC extends ContentFn | undefined,
>(vfile: {
  path: string;
  content?: C;
  serverContent?: SC;
  clientContent?: CC;
}) {
	this.store.set(vfile.path, vfile);
  return vfile as {
    path: string;
    content: C;
    serverContent: SC;
    clientContent: CC;
  } satisfies VFile;
}
	remove(path: string) {
		this.store.delete(path);
	}
	get(path: string) {
		return this.store.get(path);
	}
	has(path: string) {
		return this.store.has(path);
	}
}

type ContentFn = (path: string) => string | Promise<string>;

export type VFile = {
  path: string;
  content?: ContentFn;
  serverContent?: ContentFn;
  clientContent?: ContentFn;
  write?: boolean;
};

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

export function vfsPlugin(options: {vfs?: VFS} = {}): vite.Plugin {
  const vfsAlias = "#vono";
  const virtualModuleId = "virtual:server:";
  const vfs = options.vfs ?? new VFS();
  return {
    name: `vfs`,
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
        const path = id.replace("\0" + virtualModuleId, "");
        const file = vfs.get(path);
        if (!file) return null;
        const content = ctx?.ssr ? file.serverContent : file.clientContent;
        const c = await (content ?? file.content)?.(path);
        return c;
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
