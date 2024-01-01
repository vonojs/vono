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
          `export rpc from "${join(runtimeDir, "rpc.server")}";`,
        clientContent: () =>
          `export rpc from "${join(runtimeDir, "rpc.client")}";`,
      });
    }
  }
}