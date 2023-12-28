import * as pathe from "pathe";
import { exists } from "./tools";
import { runtimeDir } from "./runtime";
import { VFile } from "./plugins/vfs";

export async function createVirtualServerEntry(args: {
  root: string;
  serverDir: string;
  serverEntry: string;
  vfs: Map<string, VFile>;
}) {
  let path: string;
  if (
    await exists(
      pathe.join(args.root, args.serverDir, args.serverEntry),
      ".tsx",
      ".ts",
      ".js",
      ".jsx"
    )
  ) {
    path = pathe.join(
      args.root,
      args.serverDir,
      args.serverEntry,
    );
  } else {
    path = pathe.join(runtimeDir, "dev-server.ts");
  }
  args.vfs.set("/internal/server.entry", {
    path: "/internal/server.entry",
    content: async () => `import app from '${path}'; export default app;`,
  });
}