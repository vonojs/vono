import * as fs from 'fs/promises';

export async function writeTypes(){
  await fs.mkdir("node_modules/.vono", { recursive: true });
  await fs.writeFile("node_modules/.vono/app.ts", `import App from "../../server/entry"; export type App = typeof App`);
  await fs.writeFile("vono.d.ts", `
// 🅶🅴🅽🅴🆁🅰🆃🅴🅳 🅵🅸🅻🅴
// 🅴🅳🅸🆃🆂 🆆🅸🅻🅻 🅱🅴 🅻🅾🆂🆃

declare module "#server/api" {
  const api: ReturnType<
    typeof import("hono/client").hc<import(".vono/app").App>
  >;
  export default api;
}

declare module "#server/template" {
  const tmpl: string
  export default tmpl
}

declare module "#server/manifest" {
  const manifest: Record<string, any>
  export default manifest
}
`.trim())
}