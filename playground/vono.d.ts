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