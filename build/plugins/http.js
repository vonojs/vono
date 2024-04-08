import path from "path";
function isHttpProtocol(id) {
  return id?.startsWith("http://") || id?.startsWith("https://");
}
const cache = /* @__PURE__ */ new Map();
export function httpPlugin() {
  return {
    name: "vono:http",
    enforce: "pre",
    async resolveId(id, importer) {
      if (importer && isHttpProtocol(importer)) {
        if (id.startsWith("https://")) {
          return id;
        }
        const { pathname, protocol, host } = new URL(importer);
        if (id.startsWith("/")) {
          return `${protocol}//${host}${id}`;
        } else if (id.startsWith(".")) {
          const resolvedPathname = path.join(path.dirname(pathname), id);
          const newId = `${protocol}//${host}${resolvedPathname}`;
          return newId;
        }
      } else if (isHttpProtocol(id)) {
        return id;
      }
    },
    async load(id) {
      if (id === null) {
        return;
      }
      if (isHttpProtocol(id)) {
        const cached = cache.get(id);
        if (cached) {
          return cached;
        }
        const res = await fetch(id);
        if (!res.ok) {
          throw res.statusText;
        }
        const code = await res.text();
        cache.set(id, code);
        return code;
      }
    }
  };
}
