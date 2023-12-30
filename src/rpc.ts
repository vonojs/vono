import { VFile } from "./plugins/vfs";
import { join } from "pathe";
import { runtimeDir } from "./runtime";

export function buildRPC(options: {
  vfs: Map<string, VFile>,
}){
  options.vfs.set("/rpc", {
    path: "/rpc",
    serverContent: () => `export rpc from "${join(runtimeDir, "rpc.server")}";`,
    clientContent: () => `export rpc from "${join(runtimeDir, "rpc.client")}";`,
  })

  // write app 
}