import * as pathe from "pathe";
import { exists } from "../tools";
import { useVFS } from "../vfs";

export async function createVirtualServerEntry(args: {
  root: string;
  serverDir: string;
  serverEntry: string;
}) {
  const vfs = useVFS();
  let path: string | undefined;
  if (
    await exists(
      pathe.join(args.root, args.serverDir, args.serverEntry),
      ".tsx",
      ".ts",
      ".js",
      ".jsx",
    )
  ) {
    path = pathe.join(args.root, args.serverDir, args.serverEntry);
  }
  vfs.add({
    path: "/internal/server.entry",
    content: () =>
      `import { Hono } from "hono";${
        path ? `import userEntry from '${path}';` : ""
      }const server = new Hono();${
        path ? `server.route("/", userEntry);` : ""
      }export default server;`,
  });
}
