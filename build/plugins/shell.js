import * as fs from "fs/promises";
import { useVFS } from "../vfs.js";
import { join } from "node:path";
export default function shell() {
  const vfs = useVFS();
  let server;
  return {
    name: "vono:shell",
    enforce: "pre",
    configResolved: async (vite) => {
      const isBuild = vite.mode === "production";
      const dist = vite.build?.outDir || "dist";
      vfs.add({
        path: "/shell",
        serverContent: async () => {
          let content = null;
          if (isBuild) {
            try {
              content = JSON.stringify(await fs.readFile(join(dist, "client", "index.html"), "utf-8"));
            } catch {
              console.warn("Attempted to import non-existent shell html file.");
            }
            return `export default ${content};`;
          } else {
            try {
              content = await server.transformIndexHtml("/", await fs.readFile(join(vite.root, "index.html"), "utf-8"));
            } catch (e) {
              console.warn("Attempted to import non-existent shell html file.");
            }
            return `export default ${JSON.stringify(content)};`;
          }
        }
      });
    },
    configureServer: (_server) => {
      server = _server;
    }
  };
}
