import { Plugin } from "vite";
import { runtimeDir } from "../../runtime";
import { useVFS } from "../../vfs";
import { join } from "path";

export default function rpc(): Plugin {
  const vfs = useVFS();
  return {
    name: "vono:rpc",
    enforce: "post",
    configResolved: () => {
      vfs.add({
        path: "/rpc",
        serverContent: () =>
          `import rpc from "${join(runtimeDir, "rpc.server")}"; export default rpc;`,
        clientContent: () =>
          `import rpc from "${join(runtimeDir, "rpc.client")}"; export default rpc;`,
      });
    },
  };
}
