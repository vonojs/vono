import * as vite from "vite";
import { VFS } from "../../vfs";

export function vfsPlugin(options: {vfs?: VFS} = {}): vite.Plugin {
  const vfsAlias = "#vono";
  const virtualModuleId = "virtual:vono:";
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
