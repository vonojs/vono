import { VFile } from "./plugins/vfs";
import * as fs from "fs/promises";
import * as pathe from "pathe";

export function createMetadata(args: {
  vfs: Map<string, VFile>;
  isBuild: boolean;
  manifestPath: string;
  builtHtmlPath: string;
  root: string;
  transformHtml: (path: string, html: string) => Promise<string>;
}) {
  args.vfs.set("/template", {
    path: "/template",
    content: async () => {
      if (args.isBuild) {
        try {
          const cnt = await fs.readFile(
            args.builtHtmlPath,
            "utf-8",
          );
          return `export default \`${cnt}\`;`;
        } catch {
          return `export default \`\``;
        }
      } else if(args.transformHtml) {
        const raw = await fs.readFile(
          pathe.join(args.root, "index.html"),
          "utf-8",
        );
        const transformed = await args.transformHtml("/index.html", raw);
        return `export default \`${transformed}\`;`;
      } else {
        throw new Error("Cannot find #server/template. This is a bug.");
      }
    },
  });
  args.vfs.set("/manifest", {
    path: "/manifest",
    content: async () => {
      if (args.isBuild) {
        const content = await fs.readFile(
          args.manifestPath,
          "utf-8",
        );
        return `export default ${content}`;
      } else {
        return `export default {}`;
      }
    },
  });
}
