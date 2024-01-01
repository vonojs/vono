import * as fs from "fs/promises";

const types = `
declare module "#vono/manifest" {
  const manifest: import("vite").Manifest;
  export default manifest;
}

declare module "#vono/template" {
  const template: string;
  export default template;
}

declare module "#vono/rpc" {
  const rpc: ReturnType<
    typeof import("hono/client").hc<import("./entry").AppType>
  >;
  export default rpc;
}
`.trim();

export async function writeTypes() {
  await fs.writeFile(
    "node_modules/.vono/index.d.ts",
    types,
  );
}
