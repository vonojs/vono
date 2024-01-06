import * as pathe from "pathe";
import { exists } from "../tools";
import { useVFS } from "../vfs";

export async function createVirtualServerEntry(args: {
  root: string;
  serverDir: string;
  serverEntry: string;
}) {
  const vfs = useVFS();
  let path: string;
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
  } else {
    throw new Error(`Could not find server entry file at ${args.serverEntry}`);
  }
  vfs.add({
    path: "/internal/server.entry",
    content: async () => {
      globalThis.__vono ??= {
        servers: [],
      };
      const servers = globalThis.__vono.servers;
      return `
import { Hono } from "hono";
${path ? `import userEntry from '${path}';` : ""}
const server = new Hono();
${path ? `server.route("/", userEntry);` : ""}
${servers
  .map((server, i) => {
    return `import server${i} from "${server.path}"; server.route("/", server${i});`;
  })
  .join("\n")}
export default server;`;
    },
  });
}
