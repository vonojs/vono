// vite.config.ts
import { defineConfig } from "file:///Users/benten/dev/vpb/playground/node_modules/.pnpm/vite@5.0.10/node_modules/vite/dist/node/index.js";

// ../src/config.ts
import defu from "file:///Users/benten/dev/vpb/node_modules/.pnpm/defu@6.1.3/node_modules/defu/dist/defu.mjs";

// ../src/vfs.ts
var PLUGIN_NAME = "vpb";
function createVFS() {
  const vfs = /* @__PURE__ */ new Map();
  const add = (vfile) => (vfs.set(vfile.path, vfile), vfile);
  const remove = (path2) => vfs.delete(path2);
  const get = (path2) => vfs.get(path2);
  return {
    internal: vfs,
    add,
    remove,
    get
  };
}
function vfsPlugin(config) {
  const { vfs } = config;
  const vfsAlias = "#server";
  const virtualModuleId = "virtual:server:";
  return {
    name: `${PLUGIN_NAME}:vfs`,
    enforce: "pre",
    config: (config2) => {
      return {
        resolve: {
          alias: {
            [vfsAlias]: virtualModuleId
          }
        }
      };
    },
    resolveId(id) {
      if (id.startsWith(virtualModuleId)) {
        return "\0" + id;
      }
    },
    async load(id, ctx) {
      if (id.startsWith("\0" + virtualModuleId)) {
        const path2 = id.replace("\0" + virtualModuleId, "");
        const file = vfs.get(path2);
        if (!file)
          return null;
        const content = ctx?.ssr ? file.serverContent : file.clientContent;
        const c = await (content ?? file.content)?.();
        return c;
      }
    }
  };
}

// ../src/constants.ts
var PLUGIN_NAME2 = "vpb";

// ../src/adaptors/node/index.ts
import { dirname, join } from "path";

// ../src/adaptors/index.ts
var Adaptor = (target) => target;

// ../src/adaptors/node/index.ts
import { node } from "file:///Users/benten/dev/vpb/node_modules/.pnpm/unenv@1.8.0/node_modules/unenv/dist/index.mjs";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///Users/benten/dev/vpb/src/adaptors/node/index.ts";
var node_default = () => Adaptor({
  name: "node",
  runtime: join(dirname(fileURLToPath(__vite_injected_original_import_meta_url)), "entry"),
  outDir: "dist/",
  serverDir: "dist/server",
  publicDir: "dist/public",
  entryName: "index",
  env: node
});

// ../src/config.ts
function generateConfig(config) {
  return defu(config, {
    adaptor: node_default(),
    debug: false,
    vfs: createVFS(),
    server: {
      directory: "server",
      entry: "index",
      actions: {
        directory: "server/actions",
        endpoint: "/__actions"
      }
    },
    root: process.cwd(),
    typescript: {
      writeTypes: true
    }
  });
}
function configPlugin(config) {
  return {
    name: `${PLUGIN_NAME2}:config`,
    enforce: "pre",
    config: () => {
      return {
        clearScreen: false,
        appType: "custom"
      };
    },
    configResolved: (viteConfig) => {
      config.root = viteConfig.root;
      config.mode = viteConfig.command ?? "dev";
    }
  };
}

// ../src/index.ts
import { createLogger } from "file:///Users/benten/dev/vpb/node_modules/.pnpm/@gaiiaa+logger@0.1.5/node_modules/@gaiiaa/logger/dist/index.mjs";

// ../src/runtime/server.ts
import { Hono } from "file:///Users/benten/dev/vpb/node_modules/.pnpm/hono@3.11.8/node_modules/hono/dist/index.js";
function notFound() {
  return new Response("not found", { status: 404 });
}
var Server = class {
  hono = new Hono();
  handleRequest = async (c, handler) => {
    try {
      const result = await handler(c.req.raw);
      if (result instanceof Response)
        return result;
      if (typeof result === "object")
        return c.json(result);
      if (typeof result === "string")
        return c.html(result);
      if (result instanceof ReadableStream) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream"
          }
        });
      }
      if (result instanceof ArrayBuffer) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream"
          }
        });
      }
      if (result instanceof Blob) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream"
          }
        });
      }
      if (result instanceof Error) {
        log.error("server:", result.message);
        return c.json({ error: result.message }, 500);
      }
      return new Response(result);
    } catch (e) {
      if (e instanceof Error) {
        log.error("server:", e.message);
        return c.text("internal server error", 500);
      }
      if (e instanceof Response) {
        return e;
      }
    }
    return new Response("internal server error", { status: 500 });
  };
  get = (path2, handler) => {
    this.hono.get(path2, (c) => {
      return this.handleRequest(c, handler);
    });
  };
  post = (path2, handler) => {
    this.hono.post(path2, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  put = (path2, handler) => {
    this.hono.put(path2, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  patch = (path2, handler) => {
    this.hono.patch(path2, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  delete = (path2, handler) => {
    this.hono.delete(path2, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  use;
  route;
  fire;
  fetch;
  routes = this.hono.routes;
  constructor() {
    this.use = this.hono.use.bind(this.hono);
    this.route = this.hono.route.bind(this.hono);
    this.fire = this.hono.fire.bind(this.hono);
    this.fetch = this.hono.fetch.bind(this.hono);
  }
};

// ../src/tools/node-hono.ts
import { once } from "node:events";
import { Readable } from "node:stream";
import { splitCookiesString } from "file:///Users/benten/dev/vpb/node_modules/.pnpm/set-cookie-parser@2.6.0/node_modules/set-cookie-parser/lib/set-cookie.js";

// ../src/tools/invariant.ts
var AssertionError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
};
function assert(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new AssertionError(message);
  }
  return value;
}

// ../src/tools/node.ts
import { Stream } from "node:stream";
var createReadableStreamFromReadable = (source) => {
  let pump = new StreamPump(source);
  let stream = new ReadableStream(pump, pump);
  return stream;
};
var StreamPump = class {
  highWaterMark;
  accumalatedSize;
  stream;
  controller;
  constructor(stream) {
    this.highWaterMark = stream.readableHighWaterMark || new Stream.Readable().readableHighWaterMark;
    this.accumalatedSize = 0;
    this.stream = stream;
    this.enqueue = this.enqueue.bind(this);
    this.error = this.error.bind(this);
    this.close = this.close.bind(this);
  }
  size(chunk) {
    return chunk?.byteLength || 0;
  }
  start(controller) {
    this.controller = controller;
    this.stream.on("data", this.enqueue);
    this.stream.once("error", this.error);
    this.stream.once("end", this.close);
    this.stream.once("close", this.close);
  }
  pull() {
    this.resume();
  }
  cancel(reason) {
    if (this.stream.destroy) {
      this.stream.destroy(reason);
    }
    this.stream.off("data", this.enqueue);
    this.stream.off("error", this.error);
    this.stream.off("end", this.close);
    this.stream.off("close", this.close);
  }
  enqueue(chunk) {
    if (this.controller) {
      try {
        let bytes = chunk instanceof Uint8Array ? chunk : Buffer.from(chunk);
        let available = (this.controller.desiredSize || 0) - bytes.byteLength;
        this.controller.enqueue(bytes);
        if (available <= 0) {
          this.pause();
        }
      } catch (error) {
        this.controller.error(
          new Error(
            "Could not create Buffer, chunk must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object"
          )
        );
        this.cancel();
      }
    }
  }
  pause() {
    if (this.stream.pause) {
      this.stream.pause();
    }
  }
  resume() {
    if (this.stream.readable && this.stream.resume) {
      this.stream.resume();
    }
  }
  close() {
    if (this.controller) {
      this.controller.close();
      delete this.controller;
    }
  }
  error(error) {
    if (this.controller) {
      this.controller.error(error);
      delete this.controller;
    }
  }
};

// ../src/tools/node-hono.ts
function createHeaders(requestHeaders) {
  let headers = new Headers();
  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }
  return headers;
}
function createRequest(req, res) {
  let origin = req.headers.origin && "null" !== req.headers.origin ? req.headers.origin : `http://${req.headers.host}`;
  assert(req.url, 'Expected "req.url" to be defined');
  let url = new URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createHeaders(req.headers)
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = createReadableStreamFromReadable(req);
    init.duplex = "half";
  }
  return new Request(url.href, init);
}
async function handleNodeResponse(webRes, res) {
  res.statusCode = webRes.status;
  res.statusMessage = webRes.statusText;
  let cookiesStrings = [];
  for (let [name, value] of webRes.headers) {
    if (name === "set-cookie") {
      cookiesStrings.push(...splitCookiesString(value));
    } else
      res.setHeader(name, value);
  }
  if (cookiesStrings.length) {
    res.setHeader("set-cookie", cookiesStrings);
  }
  if (webRes.body) {
    let responseBody = webRes.body;
    let readable = Readable.from(responseBody);
    readable.pipe(res);
    await once(readable, "end");
  } else {
    res.end();
  }
}
var handleNodeRequest = async (app, req, res) => {
  const request = createRequest(req, res);
  handleNodeResponse(await app.fetch(request), res);
};

// ../src/devServer.ts
import * as fs from "fs/promises";
import * as pathe from "file:///Users/benten/dev/vpb/node_modules/.pnpm/pathe@1.1.1/node_modules/pathe/dist/index.mjs";
function devServerPlugin(config) {
  return {
    name: `${PLUGIN_NAME2}:dev-server`,
    enforce: "pre",
    configureServer: (server) => {
      return async () => {
        const app = new Server();
        let entry;
        try {
          entry = await server.ssrLoadModule(
            pathe.join(config.root, config.server.directory, config.server.entry)
          );
        } catch (e) {
        }
        entry && app.route("/", entry.default);
        app.get("*", async (c) => {
          const raw = await fs.readFile(
            pathe.join(config.root, "index.html"),
            "utf-8"
          );
          if (!raw) {
            throw notFound();
          }
          return new Response(await server.transformIndexHtml(c.url, raw), {
            headers: {
              "content-type": "text/html"
            }
          });
        });
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/@id/")) {
            return next();
          }
          handleNodeRequest(app, req, res);
        });
      };
    }
  };
}

// ../src/build.ts
import * as vite from "file:///Users/benten/dev/vpb/node_modules/.pnpm/vite@5.0.10_@types+node@20.8.10/node_modules/vite/dist/node/index.js";
import * as fs2 from "fs/promises";
import * as pathe2 from "file:///Users/benten/dev/vpb/node_modules/.pnpm/pathe@1.1.1/node_modules/pathe/dist/index.mjs";

// ../src/http.ts
import path from "path";
function isHttpProtocol(id) {
  return id?.startsWith("http://") || id?.startsWith("https://");
}
var cache = /* @__PURE__ */ new Map();
function httpPlugin() {
  return {
    name: "http-plugin",
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

// ../src/build.ts
function buildPlugin(config) {
  return {
    name: `${PLUGIN_NAME2}:builder:client`,
    config() {
      return {
        build: {
          outDir: config.adaptor.publicDir,
          manifest: "manifest.json"
        }
      };
    },
    configResolved() {
      config.vfs.add({
        path: "/internal/server.entry",
        content: async () => `import app from '${pathe2.join(
          config.root,
          config.server.directory,
          config.server.entry
        )}'; export default app;`
      });
    },
    writeBundle: {
      sequential: true,
      handler: async () => {
        if (globalThis.__building_server)
          return;
        globalThis.__building_server = true;
        await vite.build({
          plugins: [
            httpPlugin(),
            {
              name: `${PLUGIN_NAME2}:builder:ssr`,
              config: () => ({
                build: {
                  outDir: config.adaptor.serverDir,
                  manifest: "manifest.json"
                }
              })
            }
          ],
          appType: "custom",
          ssr: {
            noExternal: true
          },
          build: {
            ssr: true,
            emptyOutDir: false,
            rollupOptions: {
              output: {
                chunkFileNames: "[name].[hash].[format].js",
                inlineDynamicImports: config.adaptor.inlineDynamicImports
              },
              input: {
                [config.adaptor.entryName ?? "index"]: config.adaptor.runtime
              },
              external: config.adaptor.env?.external
            }
          }
        });
        fs2.copyFile(
          pathe2.join(config.adaptor.publicDir, "manifest.json"),
          pathe2.join(config.adaptor.serverDir, "manifest.client.json")
        );
        pathe2.join(config.adaptor.publicDir, "manifest.json");
        config.adaptor.onBuild && await config.adaptor.onBuild();
        fs2.writeFile(
          pathe2.join(config.adaptor.outDir, "build.json"),
          JSON.stringify({
            server: pathe2.join(
              config.adaptor.serverDir,
              config.adaptor.entryName + ".js"
            )
          })
        );
      }
    }
  };
}

// ../src/index.ts
var log = createLogger({
  name: PLUGIN_NAME2,
  level: 0
});
function plugin(config) {
  const cfg = generateConfig(config || {});
  log.setLevel(cfg.debug ? 0 : 1);
  return [
    httpPlugin(),
    configPlugin(cfg),
    vfsPlugin(cfg),
    devServerPlugin(cfg),
    buildPlugin(cfg)
  ];
}

// ../src/adaptors/cloudflare/index.ts
import { nodeless } from "file:///Users/benten/dev/vpb/node_modules/.pnpm/unenv@1.8.0/node_modules/unenv/dist/index.mjs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join as join4 } from "path";
import * as fs3 from "fs/promises";
var __vite_injected_original_import_meta_url2 = "file:///Users/benten/dev/vpb/src/adaptors/cloudflare/index.ts";
var cloudflare_default = (options = {}) => Adaptor({
  name: "cloudflare",
  runtime: join4(dirname2(fileURLToPath2(__vite_injected_original_import_meta_url2)), "entry"),
  outDir: "cloudflare/",
  serverDir: "cloudflare/server",
  publicDir: "cloudflare/public",
  entryName: "index",
  // inlineDynamicImports: true,
  env: nodeless,
  onBuild: async () => {
    await fs3.writeFile("cloudflare/wrangler.toml", `
name = "${options.name || "gaiiaa-vite-cloudflare"}"
main = "server/index.js"
assets = "public"
no-bundle = "true"
compatibility_date = "2022-07-12"
`.trim());
  }
});

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [plugin({
    debug: true,
    adaptor: cloudflare_default()
  })],
  server: {
    port: 8e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvdmZzLnRzIiwgIi4uL3NyYy9jb25zdGFudHMudHMiLCAiLi4vc3JjL2FkYXB0b3JzL25vZGUvaW5kZXgudHMiLCAiLi4vc3JjL2FkYXB0b3JzL2luZGV4LnRzIiwgIi4uL3NyYy9pbmRleC50cyIsICIuLi9zcmMvcnVudGltZS9zZXJ2ZXIudHMiLCAiLi4vc3JjL3Rvb2xzL25vZGUtaG9uby50cyIsICIuLi9zcmMvdG9vbHMvaW52YXJpYW50LnRzIiwgIi4uL3NyYy90b29scy9ub2RlLnRzIiwgIi4uL3NyYy9kZXZTZXJ2ZXIudHMiLCAiLi4vc3JjL2J1aWxkLnRzIiwgIi4uL3NyYy9odHRwLnRzIiwgIi4uL3NyYy9hZGFwdG9ycy9jbG91ZGZsYXJlL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3BsYXlncm91bmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9wbGF5Z3JvdW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9wbGF5Z3JvdW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBiYWNrZW5kIGZyb20gXCIuLi9zcmMvaW5kZXhcIjtcbmltcG9ydCBjbG91ZGZsYXJlIGZyb20gXCIuLi9zcmMvYWRhcHRvcnMvY2xvdWRmbGFyZVwiXG5pbXBvcnQgbmV0bGlmeSBmcm9tIFwiLi4vc3JjL2FkYXB0b3JzL25ldGxpZnlcIlxuaW1wb3J0IGRlbm8gZnJvbSBcIi4uL3NyYy9hZGFwdG9ycy9kZW5vXCJcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0cGx1Z2luczogW2JhY2tlbmQoeyBcblx0XHRkZWJ1ZzogdHJ1ZSwgXG5cdFx0YWRhcHRvcjogY2xvdWRmbGFyZSgpXG5cdH0pXSxcblx0c2VydmVyOiB7XG5cdFx0cG9ydDogODAwMCxcblx0fVxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvY29uZmlnLnRzXCI7aW1wb3J0IGRlZnUgZnJvbSBcImRlZnVcIjtcbmltcG9ydCB7IFZGUywgY3JlYXRlVkZTIH0gZnJvbSBcIi4vdmZzXCI7XG5pbXBvcnQgKiBhcyB2aXRlIGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBQTFVHSU5fTkFNRSB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzL3Byb21pc2VzXCI7XG5cbnR5cGUgUmVjdXJzaXZlUGFydGlhbDxUPiA9IHtcblx0W1AgaW4ga2V5b2YgVF0/OiBSZWN1cnNpdmVQYXJ0aWFsPFRbUF0+O1xufTtcblxuaW1wb3J0IHsgQWRhcHRvciB9IGZyb20gXCIuL2FkYXB0b3JzXCI7XG5pbXBvcnQgbm9kZUFkYXB0b3IgZnJvbSBcIi4vYWRhcHRvcnMvbm9kZVwiO1xuXG50eXBlIENvbmZpZyA9IHtcblx0YWRhcHRvcjogQWRhcHRvcjtcblx0ZGVidWc6IGJvb2xlYW47XG5cdHNlcnZlcjoge1xuXHRcdGRpcmVjdG9yeTogc3RyaW5nO1xuXHRcdGVudHJ5OiBzdHJpbmc7XG5cdFx0YWN0aW9uczoge1xuXHRcdFx0ZGlyZWN0b3J5OiBzdHJpbmc7XG5cdFx0XHRlbmRwb2ludDogc3RyaW5nO1xuXHRcdH07XG5cdH07XG4gIHR5cGVzY3JpcHQ6IHtcbiAgICB3cml0ZVR5cGVzOiBib29sZWFuO1xuICB9XG59O1xuXG5leHBvcnQgdHlwZSBJbnRlcm5hbENvbmZpZyA9IENvbmZpZyAmIHtcblx0aG9ubz86IHN0cmluZztcblx0cm9vdDogc3RyaW5nO1xuXHR2ZnM6IFZGUztcblx0bW9kZT86IFwiYnVpbGRcIiB8IFwic2VydmVcIiB8IFwiZGV2XCI7XG59O1xuXG5leHBvcnQgdHlwZSBJbmxpbmVDb25maWcgPSBSZWN1cnNpdmVQYXJ0aWFsPENvbmZpZz4gJiB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29uZmlnKGNvbmZpZz86IElubGluZUNvbmZpZykge1xuXHRyZXR1cm4gZGVmdTxJbnRlcm5hbENvbmZpZywgSW50ZXJuYWxDb25maWdbXT4oY29uZmlnLCB7XG5cdFx0YWRhcHRvcjogbm9kZUFkYXB0b3IoKSxcblx0XHRkZWJ1ZzogZmFsc2UsXG5cdFx0dmZzOiBjcmVhdGVWRlMoKSxcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdGRpcmVjdG9yeTogXCJzZXJ2ZXJcIixcblx0XHRcdGVudHJ5OiBcImluZGV4XCIsXG5cdFx0XHRhY3Rpb25zOiB7XG5cdFx0XHRcdGRpcmVjdG9yeTogXCJzZXJ2ZXIvYWN0aW9uc1wiLFxuXHRcdFx0XHRlbmRwb2ludDogXCIvX19hY3Rpb25zXCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0cm9vdDogcHJvY2Vzcy5jd2QoKSxcbiAgICB0eXBlc2NyaXB0OiB7XG4gICAgICB3cml0ZVR5cGVzOiB0cnVlLFxuICAgIH0sXG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB3cml0ZVRTQ29uZmlnKGNvbmZpZzogSW50ZXJuYWxDb25maWcpIHtcblx0dHJ5IHtcblx0XHRjb25zdCB0c0NvbmZpZ0pTT04gPSBhd2FpdCBmcy5yZWFkRmlsZShgdHNjb25maWcuanNvbmAsIFwidXRmLThcIik7XG5cdFx0Y29uc3QgdHNDb25maWcgPSBKU09OLnBhcnNlKHRzQ29uZmlnSlNPTik7XG5cdFx0aWYgKCF0c0NvbmZpZykge1xuXHRcdFx0ZnMud3JpdGVGaWxlKFxuXHRcdFx0XHRgdHNjb25maWcuanNvbmAsXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRpbmNsdWRlOiBbXCJub2RlX21vZHVsZXMvLnZwYlwiXSxcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRzQ29uZmlnLmluY2x1ZGUgPz89IFtdO1xuXHRcdFx0dHNDb25maWcuaW5jbHVkZS5wdXNoKFwibm9kZV9tb2R1bGVzLy52cGJcIik7XG5cdFx0XHRmcy53cml0ZUZpbGUoYHRzY29uZmlnLmpzb25gLCBKU09OLnN0cmluZ2lmeSh0c0NvbmZpZykpO1xuXHRcdH1cblx0fSBjYXRjaCB7XG5cdFx0ZnMud3JpdGVGaWxlKFxuXHRcdFx0YHRzY29uZmlnLmpzb25gLFxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRpbmNsdWRlOiBbXCJub2RlX21vZHVsZXMvLnZwYlwiXSxcblx0XHRcdH0pXG5cdFx0KTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnUGx1Z2luKGNvbmZpZzogSW50ZXJuYWxDb25maWcpOiB2aXRlLlBsdWdpbiB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogYCR7UExVR0lOX05BTUV9OmNvbmZpZ2AsXG5cdFx0ZW5mb3JjZTogXCJwcmVcIixcblx0XHRjb25maWc6ICgpID0+IHtcblx0XHRcdC8vIGlmKGNvbmZpZy50eXBlc2NyaXB0LndyaXRlVHlwZXMpIGF3YWl0IHdyaXRlVFNDb25maWcoY29uZmlnKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGNsZWFyU2NyZWVuOiBmYWxzZSxcblx0XHRcdFx0YXBwVHlwZTogXCJjdXN0b21cIixcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbmZpZ1Jlc29sdmVkOiAodml0ZUNvbmZpZykgPT4ge1xuXHRcdFx0Y29uZmlnLnJvb3QgPSB2aXRlQ29uZmlnLnJvb3Q7XG5cdFx0XHRjb25maWcubW9kZSA9IHZpdGVDb25maWcuY29tbWFuZCA/PyBcImRldlwiXG5cdFx0fSxcblx0fTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy92ZnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy92ZnMudHNcIjtpbXBvcnQgeyBJbnRlcm5hbENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgdml0ZSBmcm9tIFwidml0ZVwiO1xuY29uc3QgUExVR0lOX05BTUUgPSBcInZwYlwiO1xuXG50eXBlIENvbnRlbnRGbiA9ICgpID0+IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPjtcblxudHlwZSBWRmlsZSA9IHtcblx0cGF0aDogc3RyaW5nO1xuXHRjb250ZW50PzogQ29udGVudEZuO1xuXHRzZXJ2ZXJDb250ZW50PzogQ29udGVudEZuO1xuXHRjbGllbnRDb250ZW50PzogQ29udGVudEZuO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZGUygpOiB7XG5cdGFkZDogKHZmaWxlOiBWRmlsZSkgPT4gVkZpbGU7XG5cdHJlbW92ZTogKHBhdGg6IHN0cmluZykgPT4gdm9pZDtcblx0Z2V0OiAocGF0aDogc3RyaW5nKSA9PiBWRmlsZSB8IHVuZGVmaW5lZDtcblx0aW50ZXJuYWw6IE1hcDxzdHJpbmcsIFZGaWxlPjtcbn0ge1xuXHRjb25zdCB2ZnMgPSBuZXcgTWFwPHN0cmluZywgVkZpbGU+KCk7XG5cdGNvbnN0IGFkZCA9ICh2ZmlsZTogVkZpbGUpID0+ICh2ZnMuc2V0KHZmaWxlLnBhdGgsIHZmaWxlKSwgdmZpbGUpO1xuXHRjb25zdCByZW1vdmUgPSAocGF0aDogc3RyaW5nKSA9PiB2ZnMuZGVsZXRlKHBhdGgpO1xuXHRjb25zdCBnZXQgPSAocGF0aDogc3RyaW5nKSA9PiB2ZnMuZ2V0KHBhdGgpO1xuXHRyZXR1cm4ge1xuXHRcdGludGVybmFsOiB2ZnMsXG5cdFx0YWRkLFxuXHRcdHJlbW92ZSxcblx0XHRnZXQsXG5cdH07XG59XG5cbmV4cG9ydCB0eXBlIFZGUyA9IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVZGUz47XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWRmlsZTxcblx0QyBleHRlbmRzIENvbnRlbnRGbiB8IHVuZGVmaW5lZCxcblx0U0MgZXh0ZW5kcyBDb250ZW50Rm4gfCB1bmRlZmluZWQsXG5cdENDIGV4dGVuZHMgQ29udGVudEZuIHwgdW5kZWZpbmVkLFxuPih2ZmlsZToge1xuXHRwYXRoOiBzdHJpbmc7XG5cdGNvbnRlbnQ/OiBDO1xuXHRzZXJ2ZXJDb250ZW50PzogU0M7XG5cdGNsaWVudENvbnRlbnQ/OiBDQztcbn0pIHtcblx0cmV0dXJuIHZmaWxlIGFzIHtcblx0XHRwYXRoOiBzdHJpbmc7XG5cdFx0Y29udGVudDogQztcblx0XHRzZXJ2ZXJDb250ZW50OiBTQztcblx0XHRjbGllbnRDb250ZW50OiBDQztcblx0fSBzYXRpc2ZpZXMgVkZpbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZnNQbHVnaW4oY29uZmlnOiBJbnRlcm5hbENvbmZpZyk6IHZpdGUuUGx1Z2luIHtcblx0Y29uc3QgeyB2ZnMgfSA9IGNvbmZpZztcblx0Y29uc3QgdmZzQWxpYXMgPSBcIiNzZXJ2ZXJcIjtcblx0Y29uc3QgdmlydHVhbE1vZHVsZUlkID0gXCJ2aXJ0dWFsOnNlcnZlcjpcIjtcblxuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IGAke1BMVUdJTl9OQU1FfTp2ZnNgLFxuXHRcdGVuZm9yY2U6IFwicHJlXCIsXG5cdFx0Y29uZmlnOiAoY29uZmlnKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0YWxpYXM6IHtcblx0XHRcdFx0XHRcdFt2ZnNBbGlhc106IHZpcnR1YWxNb2R1bGVJZCxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlc29sdmVJZChpZCkge1xuXHRcdFx0aWYgKGlkLnN0YXJ0c1dpdGgodmlydHVhbE1vZHVsZUlkKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJcXDBcIiArIGlkO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YXN5bmMgbG9hZChpZCwgY3R4KSB7XG5cdFx0XHRpZiAoaWQuc3RhcnRzV2l0aChcIlxcMFwiICsgdmlydHVhbE1vZHVsZUlkKSkge1xuXHRcdFx0XHRjb25zdCBwYXRoID0gaWQucmVwbGFjZShcIlxcMFwiICsgdmlydHVhbE1vZHVsZUlkLCBcIlwiKTtcblx0XHRcdFx0Y29uc3QgZmlsZSA9IHZmcy5nZXQocGF0aCk7XG5cdFx0XHRcdGlmICghZmlsZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNvbnRlbnQgPSBjdHg/LnNzciA/IGZpbGUuc2VydmVyQ29udGVudCA6IGZpbGUuY2xpZW50Q29udGVudDtcblx0XHRcdFx0Y29uc3QgYyA9IGF3YWl0IChjb250ZW50ID8/IGZpbGUuY29udGVudCk/LigpO1xuXHRcdFx0XHRyZXR1cm4gYztcblx0XHRcdH1cblx0XHR9LFxuXHR9O1xufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9jb25zdGFudHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9jb25zdGFudHMudHNcIjtleHBvcnQgY29uc3QgUExVR0lOX05BTUUgPSBcInZwYlwiOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9hZGFwdG9ycy9ub2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL2FkYXB0b3JzL25vZGUvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9hZGFwdG9ycy9ub2RlL2luZGV4LnRzXCI7aW1wb3J0IHsgZGlybmFtZSwgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBBZGFwdG9yIH0gZnJvbSBcIi4uL2luZGV4XCI7XG5pbXBvcnQgeyBub2RlIH0gZnJvbSBcInVuZW52XCJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tIFwidXJsXCI7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IEFkYXB0b3Ioe1xuICBuYW1lOiBcIm5vZGVcIixcbiAgcnVudGltZTogam9pbihkaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSksIFwiZW50cnlcIiksXG4gIG91dERpcjogXCJkaXN0L1wiLFxuICBzZXJ2ZXJEaXI6IFwiZGlzdC9zZXJ2ZXJcIixcbiAgcHVibGljRGlyOiBcImRpc3QvcHVibGljXCIsXG4gIGVudHJ5TmFtZTogXCJpbmRleFwiLFxuICBlbnY6IG5vZGUsXG59KTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvYWRhcHRvcnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvYWRhcHRvcnMvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9hZGFwdG9ycy9pbmRleC50c1wiO2V4cG9ydCB0eXBlIEFkYXB0b3IgPSB7XG4gIG5hbWU6IHN0cmluZztcblx0cnVudGltZTogc3RyaW5nO1xuICBvdXREaXI6IHN0cmluZztcbiAgc2VydmVyRGlyOiBzdHJpbmc7XG4gIHB1YmxpY0Rpcjogc3RyaW5nO1xuICBlbnRyeU5hbWU6IHN0cmluZztcbiAgZW50cnlEaXI/OiBzdHJpbmc7XG4gIGlubGluZUR5bmFtaWNJbXBvcnRzPzogYm9vbGVhbjtcbiAgZW52Pzoge1xuICAgIGFsaWFzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICBleHRlcm5hbD86IHN0cmluZ1tdO1xuICAgIGluamVjdD86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPjtcbiAgICBwb2x5ZmlsbD86IHN0cmluZ1tdO1xuICB9LFxuICBvbkJ1aWxkPzogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG59O1xuXG5leHBvcnQgY29uc3QgQWRhcHRvciA9IDxUPih0YXJnZXQ6IEFkYXB0b3IpOiBBZGFwdG9yID0+IHRhcmdldDsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9pbmRleC50c1wiO2ltcG9ydCAqIGFzIHZpdGUgZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IElubGluZUNvbmZpZywgZ2VuZXJhdGVDb25maWcsIGNvbmZpZ1BsdWdpbiB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgY3JlYXRlTG9nZ2VyIH0gZnJvbSBcIkBnYWlpYWEvbG9nZ2VyXCI7XG5pbXBvcnQgeyB2ZnNQbHVnaW4gfSBmcm9tIFwiLi92ZnNcIjtcbmltcG9ydCB7IGRldlNlcnZlclBsdWdpbiB9IGZyb20gXCIuL2RldlNlcnZlclwiO1xuaW1wb3J0IHsgUExVR0lOX05BTUUgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGJ1aWxkUGx1Z2luIH0gZnJvbSBcIi4vYnVpbGRcIjtcbmltcG9ydCB7IGh0dHBQbHVnaW4gfSBmcm9tIFwiLi9odHRwXCI7XG5cbmV4cG9ydCBjb25zdCBsb2cgPSBjcmVhdGVMb2dnZXIoe1xuXHRuYW1lOiBQTFVHSU5fTkFNRSxcblx0bGV2ZWw6IDAsXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGx1Z2luKGNvbmZpZz86IElubGluZUNvbmZpZyk6IHZpdGUuUGx1Z2luW10ge1xuXG5cdGNvbnN0IGNmZyA9IGdlbmVyYXRlQ29uZmlnKGNvbmZpZyB8fCB7fSk7XG5cdGxvZy5zZXRMZXZlbChjZmcuZGVidWcgPyAwIDogMSk7XG5cblx0cmV0dXJuIFtcblx0XHRodHRwUGx1Z2luKCksXG5cdFx0Y29uZmlnUGx1Z2luKGNmZyksXG5cdFx0dmZzUGx1Z2luKGNmZyksXG5cdFx0ZGV2U2VydmVyUGx1Z2luKGNmZyksXG5cdFx0YnVpbGRQbHVnaW4oY2ZnKSxcblx0XTtcbn1cblxuXG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9ydW50aW1lXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL3J1bnRpbWUvc2VydmVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvcnVudGltZS9zZXJ2ZXIudHNcIjtpbXBvcnQgeyBDb250ZXh0LCBIb25vIH0gZnJvbSBcImhvbm9cIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuLlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gbm90Rm91bmQoKSB7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UoXCJub3QgZm91bmRcIiwgeyBzdGF0dXM6IDQwNCB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZGlyZWN0KHVybDogc3RyaW5nLCBzdGF0dXM6IG51bWJlciA9IDMwMikge1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICBsb2NhdGlvbjogdXJsLFxuICAgIH0sXG4gICAgc3RhdHVzLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb24oZGF0YTogYW55LCBzdGF0dXM6IG51bWJlciA9IDIwMCkge1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KGRhdGEpLCB7XG4gICAgaGVhZGVyczoge1xuICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgfSxcbiAgICBzdGF0dXMsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbChkYXRhOiBzdHJpbmcsIHN0YXR1czogbnVtYmVyID0gMjAwKSB7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiY29udGVudC10eXBlXCI6IFwidGV4dC9odG1sXCIsXG4gICAgfSxcbiAgICBzdGF0dXMsXG4gIH0pO1xufVxuY2xhc3MgU2VydmVyIHtcbiAgaG9ubyA9IG5ldyBIb25vKCk7XG4gIGhhbmRsZVJlcXVlc3QgPSBhc3luYyAoYzogQ29udGV4dCwgaGFuZGxlcjogYW55KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoYy5yZXEucmF3KTtcbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXNwb25zZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcIm9iamVjdFwiKSByZXR1cm4gYy5qc29uKHJlc3VsdCk7XG4gICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGMuaHRtbChyZXN1bHQpO1xuICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlYWRhYmxlU3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocmVzdWx0LCB7XG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3VsdCwge1xuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3VsdCwge1xuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgbG9nLmVycm9yKFwic2VydmVyOlwiLCByZXN1bHQubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBjLmpzb24oeyBlcnJvcjogcmVzdWx0Lm1lc3NhZ2UgfSwgNTAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGxvZy5lcnJvcihcInNlcnZlcjpcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIGMudGV4dCgnaW50ZXJuYWwgc2VydmVyIGVycm9yJywgNTAwKTtcbiAgICAgIH1cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJpbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfTtcbiAgZ2V0ID0gKHBhdGg6IHN0cmluZywgaGFuZGxlcjogKHI6IFJlcXVlc3QpID0+IGFueSkgPT4ge1xuICAgIHRoaXMuaG9uby5nZXQocGF0aCwgKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlcXVlc3QoYywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG4gIHBvc3QgPSAocGF0aDogc3RyaW5nLCBoYW5kbGVyOiAocjogUmVxdWVzdCkgPT4gYW55KSA9PiB7XG4gICAgdGhpcy5ob25vLnBvc3QocGF0aCwgYXN5bmMgKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlcXVlc3QoYywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG4gIHB1dCA9IChwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IChyOiBSZXF1ZXN0KSA9PiBhbnkpID0+IHtcbiAgICB0aGlzLmhvbm8ucHV0KHBhdGgsIGFzeW5jIChjKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVSZXF1ZXN0KGMsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9O1xuICBwYXRjaCA9IChwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IChyOiBSZXF1ZXN0KSA9PiBhbnkpID0+IHtcbiAgICB0aGlzLmhvbm8ucGF0Y2gocGF0aCwgYXN5bmMgKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlcXVlc3QoYywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG4gIGRlbGV0ZSA9IChwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IChyOiBSZXF1ZXN0KSA9PiBhbnkpID0+IHtcbiAgICB0aGlzLmhvbm8uZGVsZXRlKHBhdGgsIGFzeW5jIChjKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVSZXF1ZXN0KGMsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9O1xuICB1c2U6IEhvbm9bXCJ1c2VcIl07XG4gIHJvdXRlOiBIb25vW1wicm91dGVcIl07XG4gIGZpcmU6IEhvbm9bXCJmaXJlXCJdO1xuICBmZXRjaDogSG9ub1tcImZldGNoXCJdO1xuICByb3V0ZXMgPSB0aGlzLmhvbm8ucm91dGVzO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnVzZSA9IHRoaXMuaG9uby51c2UuYmluZCh0aGlzLmhvbm8pO1xuICAgIHRoaXMucm91dGUgPSB0aGlzLmhvbm8ucm91dGUuYmluZCh0aGlzLmhvbm8pO1xuICAgIHRoaXMuZmlyZSA9IHRoaXMuaG9uby5maXJlLmJpbmQodGhpcy5ob25vKTtcbiAgICB0aGlzLmZldGNoID0gdGhpcy5ob25vLmZldGNoLmJpbmQodGhpcy5ob25vKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZXJ2ZXI7XG5leHBvcnQgeyBTZXJ2ZXIgfTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy90b29sc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy90b29scy9ub2RlLWhvbm8udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy90b29scy9ub2RlLWhvbm8udHNcIjsvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbipcbiogIFRoaXMgbW9kdWxlIGhhcyBiZWVuIGFkYXB0ZWQgZnJvbSBSZW1peCdzIFZpdGUgcGx1Z2luLlxuKiAgaHR0cHM6Ly9yZW1peC5ydW5cbipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5pbXBvcnQgeyBIb25vIH0gZnJvbSBcImhvbm9cIjtcbmltcG9ydCB0eXBlIHtcblx0SW5jb21pbmdIdHRwSGVhZGVycyxcblx0SW5jb21pbmdNZXNzYWdlLFxuXHRTZXJ2ZXJSZXNwb25zZSxcbn0gZnJvbSBcIm5vZGU6aHR0cFwiO1xuaW1wb3J0IHsgb25jZSB9IGZyb20gXCJub2RlOmV2ZW50c1wiO1xuaW1wb3J0IHsgUmVhZGFibGUgfSBmcm9tIFwibm9kZTpzdHJlYW1cIjtcbi8vIEB0cy1leHBlY3QtZXJyb3JcbmltcG9ydCB7IHNwbGl0Q29va2llc1N0cmluZyB9IGZyb20gXCJzZXQtY29va2llLXBhcnNlclwiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4vaW52YXJpYW50XCI7XG5pbXBvcnQgeyBjcmVhdGVSZWFkYWJsZVN0cmVhbUZyb21SZWFkYWJsZSB9IGZyb20gXCIuL25vZGVcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuLi9pbmRleFwiO1xuaW1wb3J0IFNlcnZlciBmcm9tIFwiLi4vcnVudGltZS9zZXJ2ZXJcIjtcblxuZnVuY3Rpb24gY3JlYXRlSGVhZGVycyhyZXF1ZXN0SGVhZGVyczogSW5jb21pbmdIdHRwSGVhZGVycykge1xuXHRsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG5cblx0Zm9yIChsZXQgW2tleSwgdmFsdWVzXSBvZiBPYmplY3QuZW50cmllcyhyZXF1ZXN0SGVhZGVycykpIHtcblx0XHRpZiAodmFsdWVzKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG5cdFx0XHRcdGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuXHRcdFx0XHRcdGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoZWFkZXJzLnNldChrZXksIHZhbHVlcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGhlYWRlcnM7XG59XG5cbi8vIEJhc2VkIG9uIGBjcmVhdGVSZW1peFJlcXVlc3RgIGluIHBhY2thZ2VzL3JlbWl4LWV4cHJlc3Mvc2VydmVyLnRzXG5mdW5jdGlvbiBjcmVhdGVSZXF1ZXN0KHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKTogUmVxdWVzdCB7XG5cdGxldCBvcmlnaW4gPVxuXHRcdHJlcS5oZWFkZXJzLm9yaWdpbiAmJiBcIm51bGxcIiAhPT0gcmVxLmhlYWRlcnMub3JpZ2luXG5cdFx0XHQ/IHJlcS5oZWFkZXJzLm9yaWdpblxuXHRcdFx0OiBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gO1xuXHRhc3NlcnQocmVxLnVybCwgJ0V4cGVjdGVkIFwicmVxLnVybFwiIHRvIGJlIGRlZmluZWQnKTtcblx0bGV0IHVybCA9IG5ldyBVUkwocmVxLnVybCwgb3JpZ2luKTtcblxuXHRsZXQgaW5pdDogUmVxdWVzdEluaXQgPSB7XG5cdFx0bWV0aG9kOiByZXEubWV0aG9kLFxuXHRcdGhlYWRlcnM6IGNyZWF0ZUhlYWRlcnMocmVxLmhlYWRlcnMpLFxuXHR9O1xuXG5cdGlmIChyZXEubWV0aG9kICE9PSBcIkdFVFwiICYmIHJlcS5tZXRob2QgIT09IFwiSEVBRFwiKSB7XG5cdFx0aW5pdC5ib2R5ID0gY3JlYXRlUmVhZGFibGVTdHJlYW1Gcm9tUmVhZGFibGUocmVxKTtcblx0XHQoaW5pdCBhcyB7IGR1cGxleDogXCJoYWxmXCIgfSkuZHVwbGV4ID0gXCJoYWxmXCI7XG5cdH1cblxuXHRyZXR1cm4gbmV3IFJlcXVlc3QodXJsLmhyZWYsIGluaXQpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gc29saWQtc3RhcnQncyBgaGFuZGxlTm9kZVJlc3BvbnNlYDpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2xpZGpzL3NvbGlkLXN0YXJ0L2Jsb2IvNzM5ODE2Mzg2OWI0ODljY2U1MDNjMTY3ZTI4NDg5MWNmNTFhNjYxMy9wYWNrYWdlcy9zdGFydC9ub2RlL2ZldGNoLmpzI0wxNjItTDE4NVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTm9kZVJlc3BvbnNlKHdlYlJlczogUmVzcG9uc2UsIHJlczogU2VydmVyUmVzcG9uc2UpIHtcblx0cmVzLnN0YXR1c0NvZGUgPSB3ZWJSZXMuc3RhdHVzO1xuXHRyZXMuc3RhdHVzTWVzc2FnZSA9IHdlYlJlcy5zdGF0dXNUZXh0O1xuXG5cdGxldCBjb29raWVzU3RyaW5ncyA9IFtdO1xuXG5cdGZvciAobGV0IFtuYW1lLCB2YWx1ZV0gb2Ygd2ViUmVzLmhlYWRlcnMpIHtcblx0XHRpZiAobmFtZSA9PT0gXCJzZXQtY29va2llXCIpIHtcblx0XHRcdGNvb2tpZXNTdHJpbmdzLnB1c2goLi4uc3BsaXRDb29raWVzU3RyaW5nKHZhbHVlKSk7XG5cdFx0fSBlbHNlIHJlcy5zZXRIZWFkZXIobmFtZSwgdmFsdWUpO1xuXHR9XG5cblx0aWYgKGNvb2tpZXNTdHJpbmdzLmxlbmd0aCkge1xuXHRcdHJlcy5zZXRIZWFkZXIoXCJzZXQtY29va2llXCIsIGNvb2tpZXNTdHJpbmdzKTtcblx0fVxuXG5cdGlmICh3ZWJSZXMuYm9keSkge1xuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMjk4Njdcblx0XHRsZXQgcmVzcG9uc2VCb2R5ID0gd2ViUmVzLmJvZHkgYXMgdW5rbm93biBhcyBBc3luY0l0ZXJhYmxlPFVpbnQ4QXJyYXk+O1xuXHRcdGxldCByZWFkYWJsZSA9IFJlYWRhYmxlLmZyb20ocmVzcG9uc2VCb2R5KTtcblx0XHRyZWFkYWJsZS5waXBlKHJlcyk7XG5cdFx0YXdhaXQgb25jZShyZWFkYWJsZSwgXCJlbmRcIik7XG5cdH0gZWxzZSB7XG5cdFx0cmVzLmVuZCgpO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVOb2RlUmVxdWVzdCA9IGFzeW5jIChcblx0YXBwOiBTZXJ2ZXIsXG5cdHJlcTogYW55LFxuXHRyZXM6IGFueSxcbikgPT4ge1xuICBjb25zdCByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdChyZXEsIHJlcyk7XG4gIGhhbmRsZU5vZGVSZXNwb25zZShhd2FpdCBhcHAuZmV0Y2gocmVxdWVzdCksIHJlcyk7XG59IFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL3Rvb2xzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL3Rvb2xzL2ludmFyaWFudC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL3Rvb2xzL2ludmFyaWFudC50c1wiO2NsYXNzIEFzc2VydGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nKSB7XG5cdFx0c3VwZXIobWVzc2FnZSk7XG5cdFx0dGhpcy5uYW1lID0gXCJBc3NlcnRpb25FcnJvclwiO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnQodmFsdWU6IGJvb2xlYW4sIG1lc3NhZ2U/OiBzdHJpbmcpOiBhc3NlcnRzIHZhbHVlO1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0PFQ+KFxuXHR2YWx1ZTogVCB8IG51bGwgfCB1bmRlZmluZWQsXG5cdG1lc3NhZ2U/OiBzdHJpbmdcbik6IGFzc2VydHMgdmFsdWUgaXMgVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydCh2YWx1ZTogYW55LCBtZXNzYWdlPzogc3RyaW5nKSB7XG5cdGlmICh2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0dGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1lc3NhZ2UpO1xuXHR9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy90b29sc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy90b29scy9ub2RlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvdG9vbHMvbm9kZS50c1wiO2ltcG9ydCB0eXBlIHsgUmVhZGFibGUsIFdyaXRhYmxlIH0gZnJvbSBcIm5vZGU6c3RyZWFtXCI7XG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tIFwibm9kZTpzdHJlYW1cIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUmVhZGFibGVTdHJlYW1Ub1dyaXRhYmxlKFxuICAgIHN0cmVhbTogUmVhZGFibGVTdHJlYW0sXG4gICAgd3JpdGFibGU6IFdyaXRhYmxlXG4pIHtcbiAgICBsZXQgcmVhZGVyID0gc3RyZWFtLmdldFJlYWRlcigpO1xuICAgIGxldCBmbHVzaGFibGUgPSB3cml0YWJsZSBhcyB7IGZsdXNoPzogRnVuY3Rpb24gfTtcblxuICAgIHRyeSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICB3cml0YWJsZS5lbmQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd3JpdGFibGUud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBmbHVzaGFibGUuZmx1c2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGZsdXNoYWJsZS5mbHVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgd3JpdGFibGUuZGVzdHJveShlcnJvciBhcyBFcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlQXN5bmNJdGVyYWJsZVRvV3JpdGFibGUoXG4gICAgaXRlcmFibGU6IEFzeW5jSXRlcmFibGU8VWludDhBcnJheT4sXG4gICAgd3JpdGFibGU6IFdyaXRhYmxlXG4pIHtcbiAgICB0cnkge1xuICAgICAgICBmb3IgYXdhaXQgKGxldCBjaHVuayBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgd3JpdGFibGUud3JpdGUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICAgIHdyaXRhYmxlLmVuZCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgd3JpdGFibGUuZGVzdHJveShlcnJvcik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRhYmxlU3RyZWFtVG9TdHJpbmcoXG4gICAgc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PixcbiAgICBlbmNvZGluZz86IEJ1ZmZlckVuY29kaW5nXG4pIHtcbiAgICBsZXQgcmVhZGVyID0gc3RyZWFtLmdldFJlYWRlcigpO1xuICAgIGxldCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgbGV0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoZW5jb2RpbmcpO1xufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVhZGFibGVTdHJlYW1Gcm9tUmVhZGFibGUgPSAoXG4gICAgc291cmNlOiBSZWFkYWJsZSAmIHsgcmVhZGFibGVIaWdoV2F0ZXJNYXJrPzogbnVtYmVyIH1cbikgPT4ge1xuICAgIGxldCBwdW1wID0gbmV3IFN0cmVhbVB1bXAoc291cmNlKTtcbiAgICBsZXQgc3RyZWFtID0gbmV3IFJlYWRhYmxlU3RyZWFtKHB1bXAsIHB1bXApO1xuICAgIHJldHVybiBzdHJlYW07XG59O1xuXG5jbGFzcyBTdHJlYW1QdW1wIHtcbiAgICBwdWJsaWMgaGlnaFdhdGVyTWFyazogbnVtYmVyO1xuICAgIHB1YmxpYyBhY2N1bWFsYXRlZFNpemU6IG51bWJlcjtcbiAgICBwcml2YXRlIHN0cmVhbTogU3RyZWFtICYge1xuICAgICAgICByZWFkYWJsZUhpZ2hXYXRlck1hcms/OiBudW1iZXI7XG4gICAgICAgIHJlYWRhYmxlPzogYm9vbGVhbjtcbiAgICAgICAgcmVzdW1lPzogKCkgPT4gdm9pZDtcbiAgICAgICAgcGF1c2U/OiAoKSA9PiB2b2lkO1xuICAgICAgICBkZXN0cm95PzogKGVycm9yPzogRXJyb3IpID0+IHZvaWQ7XG4gICAgfTtcbiAgICBwcml2YXRlIGNvbnRyb2xsZXI/OiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VWludDhBcnJheT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3RyZWFtOiBTdHJlYW0gJiB7XG4gICAgICAgICAgICByZWFkYWJsZUhpZ2hXYXRlck1hcms/OiBudW1iZXI7XG4gICAgICAgICAgICByZWFkYWJsZT86IGJvb2xlYW47XG4gICAgICAgICAgICByZXN1bWU/OiAoKSA9PiB2b2lkO1xuICAgICAgICAgICAgcGF1c2U/OiAoKSA9PiB2b2lkO1xuICAgICAgICAgICAgZGVzdHJveT86IChlcnJvcj86IEVycm9yKSA9PiB2b2lkO1xuICAgICAgICB9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuaGlnaFdhdGVyTWFyayA9XG4gICAgICAgICAgICBzdHJlYW0ucmVhZGFibGVIaWdoV2F0ZXJNYXJrIHx8XG4gICAgICAgICAgICBuZXcgU3RyZWFtLlJlYWRhYmxlKCkucmVhZGFibGVIaWdoV2F0ZXJNYXJrO1xuICAgICAgICB0aGlzLmFjY3VtYWxhdGVkU2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICB0aGlzLmVucXVldWUgPSB0aGlzLmVucXVldWUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5lcnJvciA9IHRoaXMuZXJyb3IuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jbG9zZSA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBzaXplKGNodW5rOiBVaW50OEFycmF5KSB7XG4gICAgICAgIHJldHVybiBjaHVuaz8uYnl0ZUxlbmd0aCB8fCAwO1xuICAgIH1cblxuICAgIHN0YXJ0KGNvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxVaW50OEFycmF5Pikge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgICB0aGlzLnN0cmVhbS5vbihcImRhdGFcIiwgdGhpcy5lbnF1ZXVlKTtcbiAgICAgICAgdGhpcy5zdHJlYW0ub25jZShcImVycm9yXCIsIHRoaXMuZXJyb3IpO1xuICAgICAgICB0aGlzLnN0cmVhbS5vbmNlKFwiZW5kXCIsIHRoaXMuY2xvc2UpO1xuICAgICAgICB0aGlzLnN0cmVhbS5vbmNlKFwiY2xvc2VcIiwgdGhpcy5jbG9zZSk7XG4gICAgfVxuXG4gICAgcHVsbCgpIHtcbiAgICAgICAgdGhpcy5yZXN1bWUoKTtcbiAgICB9XG5cbiAgICBjYW5jZWwocmVhc29uPzogRXJyb3IpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RyZWFtLmRlc3Ryb3kpIHtcbiAgICAgICAgICAgIHRoaXMuc3RyZWFtLmRlc3Ryb3kocmVhc29uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RyZWFtLm9mZihcImRhdGFcIiwgdGhpcy5lbnF1ZXVlKTtcbiAgICAgICAgdGhpcy5zdHJlYW0ub2ZmKFwiZXJyb3JcIiwgdGhpcy5lcnJvcik7XG4gICAgICAgIHRoaXMuc3RyZWFtLm9mZihcImVuZFwiLCB0aGlzLmNsb3NlKTtcbiAgICAgICAgdGhpcy5zdHJlYW0ub2ZmKFwiY2xvc2VcIiwgdGhpcy5jbG9zZSk7XG4gICAgfVxuXG4gICAgZW5xdWV1ZShjaHVuazogVWludDhBcnJheSB8IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBieXRlcyA9IGNodW5rIGluc3RhbmNlb2YgVWludDhBcnJheSA/IGNodW5rIDogQnVmZmVyLmZyb20oY2h1bmspO1xuXG4gICAgICAgICAgICAgICAgbGV0IGF2YWlsYWJsZSA9ICh0aGlzLmNvbnRyb2xsZXIuZGVzaXJlZFNpemUgfHwgMCkgLSBieXRlcy5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlci5lbnF1ZXVlKGJ5dGVzKTtcbiAgICAgICAgICAgICAgICBpZiAoYXZhaWxhYmxlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ291bGQgbm90IGNyZWF0ZSBCdWZmZXIsIGNodW5rIG11c3QgYmUgb2YgdHlwZSBzdHJpbmcgb3IgYW4gaW5zdGFuY2Ugb2YgQnVmZmVyLCBBcnJheUJ1ZmZlciwgb3IgQXJyYXkgb3IgYW4gQXJyYXktbGlrZSBPYmplY3RcIlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0cmVhbS5wYXVzZSkge1xuICAgICAgICAgICAgdGhpcy5zdHJlYW0ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RyZWFtLnJlYWRhYmxlICYmIHRoaXMuc3RyZWFtLnJlc3VtZSkge1xuICAgICAgICAgICAgdGhpcy5zdHJlYW0ucmVzdW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyLmNsb3NlKCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5jb250cm9sbGVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbGxlci5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5jb250cm9sbGVyO1xuICAgICAgICB9XG4gICAgfVxufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9kZXZTZXJ2ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9kZXZTZXJ2ZXIudHNcIjtpbXBvcnQgeyBJbnRlcm5hbENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgdml0ZSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgUExVR0lOX05BTUUgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IFNlcnZlciwgbm90Rm91bmQgfSBmcm9tIFwiLi9ydW50aW1lL3NlcnZlclwiO1xuaW1wb3J0IHsgaGFuZGxlTm9kZVJlcXVlc3QgfSBmcm9tIFwiLi90b29scy9ub2RlLWhvbm9cIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0ICogYXMgcGF0aGUgZnJvbSBcInBhdGhlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXZTZXJ2ZXJQbHVnaW4oY29uZmlnOiBJbnRlcm5hbENvbmZpZyk6IHZpdGUuUGx1Z2luIHtcblx0cmV0dXJuIHtcblx0XHRuYW1lOiBgJHtQTFVHSU5fTkFNRX06ZGV2LXNlcnZlcmAsXG5cdFx0ZW5mb3JjZTogXCJwcmVcIixcblx0XHRjb25maWd1cmVTZXJ2ZXI6IChzZXJ2ZXIpID0+IHtcblx0XHRcdHJldHVybiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFwcCA9IG5ldyBTZXJ2ZXIoKTtcblx0XHRcdFx0LyogbG9hZCB0aGUgZW50cnkgKi9cblx0XHRcdFx0bGV0IGVudHJ5O1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGVudHJ5ID0gYXdhaXQgc2VydmVyLnNzckxvYWRNb2R1bGUoXG5cdFx0XHRcdFx0XHRwYXRoZS5qb2luKGNvbmZpZy5yb290LCBjb25maWcuc2VydmVyLmRpcmVjdG9yeSwgY29uZmlnLnNlcnZlci5lbnRyeSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRlbnRyeSAmJiBhcHAucm91dGUoXCIvXCIsIGVudHJ5LmRlZmF1bHQpO1xuXHRcdFx0XHQvLyBzZXJ2ZXIgZmFsbGJhY2sgdG8gaW5kZXguaHRtbFxuXHRcdFx0XHRhcHAuZ2V0KFwiKlwiLCBhc3luYyAoYykgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHJhdyA9IGF3YWl0IGZzLnJlYWRGaWxlKFxuXHRcdFx0XHRcdFx0cGF0aGUuam9pbihjb25maWcucm9vdCEsIFwiaW5kZXguaHRtbFwiKSxcblx0XHRcdFx0XHRcdFwidXRmLThcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0aWYgKCFyYXcpIHtcblx0XHRcdFx0XHRcdHRocm93IG5vdEZvdW5kKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBuZXcgUmVzcG9uc2UoYXdhaXQgc2VydmVyLnRyYW5zZm9ybUluZGV4SHRtbChjLnVybCwgcmF3KSwge1xuXHRcdFx0XHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHRcdFx0XHRcImNvbnRlbnQtdHlwZVwiOiBcInRleHQvaHRtbFwiLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcblx0XHRcdFx0XHRpZiAocmVxLnVybD8uc3RhcnRzV2l0aChcIi9AaWQvXCIpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRoYW5kbGVOb2RlUmVxdWVzdChhcHAsIHJlcSwgcmVzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvYnVpbGQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JlbnRlbi9kZXYvdnBiL3NyYy9idWlsZC50c1wiO2ltcG9ydCAqIGFzIHZpdGUgZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IFBMVUdJTl9OQU1FIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBJbnRlcm5hbENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgKiBhcyBwYXRoZSBmcm9tIFwicGF0aGVcIjtcbmltcG9ydCB7IGh0dHBQbHVnaW4gfSBmcm9tIFwiLi9odHRwXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFBsdWdpbihjb25maWc6IEludGVybmFsQ29uZmlnKTogdml0ZS5QbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IGAke1BMVUdJTl9OQU1FfTpidWlsZGVyOmNsaWVudGAsXG4gICAgY29uZmlnKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICBvdXREaXI6IGNvbmZpZy5hZGFwdG9yLnB1YmxpY0RpcixcbiAgICAgICAgICBtYW5pZmVzdDogXCJtYW5pZmVzdC5qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gICAgY29uZmlnUmVzb2x2ZWQoKSB7XG4gICAgICBjb25maWcudmZzLmFkZCh7XG4gICAgICAgIHBhdGg6IFwiL2ludGVybmFsL3NlcnZlci5lbnRyeVwiLFxuICAgICAgICBjb250ZW50OiBhc3luYyAoKSA9PlxuICAgICAgICAgIGBpbXBvcnQgYXBwIGZyb20gJyR7XG4gICAgICAgICAgICBwYXRoZS5qb2luKFxuICAgICAgICAgICAgICBjb25maWcucm9vdCxcbiAgICAgICAgICAgICAgY29uZmlnLnNlcnZlci5kaXJlY3RvcnksXG4gICAgICAgICAgICAgIGNvbmZpZy5zZXJ2ZXIuZW50cnksXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSc7IGV4cG9ydCBkZWZhdWx0IGFwcDtgLFxuICAgICAgfSk7XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZToge1xuICAgICAgc2VxdWVudGlhbDogdHJ1ZSxcbiAgICAgIGhhbmRsZXI6IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy9AdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGlmIChnbG9iYWxUaGlzLl9fYnVpbGRpbmdfc2VydmVyKSByZXR1cm47XG4gICAgICAgIC8vQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBnbG9iYWxUaGlzLl9fYnVpbGRpbmdfc2VydmVyID0gdHJ1ZTtcbiAgICAgICAgYXdhaXQgdml0ZS5idWlsZCh7XG4gICAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgaHR0cFBsdWdpbigpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiBgJHtQTFVHSU5fTkFNRX06YnVpbGRlcjpzc3JgLFxuICAgICAgICAgICAgICBjb25maWc6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgICAgIG91dERpcjogY29uZmlnLmFkYXB0b3Iuc2VydmVyRGlyLFxuICAgICAgICAgICAgICAgICAgbWFuaWZlc3Q6IFwibWFuaWZlc3QuanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFwcFR5cGU6IFwiY3VzdG9tXCIsXG4gICAgICAgICAgc3NyOiB7XG4gICAgICAgICAgICBub0V4dGVybmFsOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHNzcjogdHJ1ZSxcbiAgICAgICAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwiW25hbWVdLltoYXNoXS5bZm9ybWF0XS5qc1wiLFxuICAgICAgICAgICAgICAgIGlubGluZUR5bmFtaWNJbXBvcnRzOiBjb25maWcuYWRhcHRvci5pbmxpbmVEeW5hbWljSW1wb3J0cyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICBbY29uZmlnLmFkYXB0b3IuZW50cnlOYW1lID8/IFwiaW5kZXhcIl06IGNvbmZpZy5hZGFwdG9yLnJ1bnRpbWUsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGV4dGVybmFsOiBjb25maWcuYWRhcHRvci5lbnY/LmV4dGVybmFsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgZnMuY29weUZpbGUoXG4gICAgICAgICAgcGF0aGUuam9pbihjb25maWcuYWRhcHRvci5wdWJsaWNEaXIsIFwibWFuaWZlc3QuanNvblwiKSxcbiAgICAgICAgICBwYXRoZS5qb2luKGNvbmZpZy5hZGFwdG9yLnNlcnZlckRpciwgXCJtYW5pZmVzdC5jbGllbnQuanNvblwiKSxcbiAgICAgICAgKTtcbiAgICAgICAgcGF0aGUuam9pbihjb25maWcuYWRhcHRvci5wdWJsaWNEaXIsIFwibWFuaWZlc3QuanNvblwiKTtcbiAgICAgICAgY29uZmlnLmFkYXB0b3Iub25CdWlsZCAmJiAoYXdhaXQgY29uZmlnLmFkYXB0b3Iub25CdWlsZCgpKTtcbiAgICAgICAgZnMud3JpdGVGaWxlKFxuICAgICAgICAgIHBhdGhlLmpvaW4oY29uZmlnLmFkYXB0b3Iub3V0RGlyLCBcImJ1aWxkLmpzb25cIiksXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgc2VydmVyOiBwYXRoZS5qb2luKFxuICAgICAgICAgICAgICBjb25maWcuYWRhcHRvci5zZXJ2ZXJEaXIsXG4gICAgICAgICAgICAgIGNvbmZpZy5hZGFwdG9yLmVudHJ5TmFtZSArIFwiLmpzXCJcbiAgICAgICAgICAgICksXG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvaHR0cC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL2h0dHAudHNcIjtpbXBvcnQgeyBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IHR5cGUgUmVzb2x2ZUlkRmFsbGJhY2sgPSAoXG5cdHNwZWNpZmllcjogc3RyaW5nLFxuXHRpbXBvcnRlcj86IHN0cmluZ1xuKSA9PiBzdHJpbmcgfCB2b2lkO1xuXG5mdW5jdGlvbiBpc0h0dHBQcm90b2NvbChpZDogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCkge1xuXHRyZXR1cm4gaWQ/LnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpIHx8IGlkPy5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIik7XG59XG5cbmNvbnN0IGNhY2hlID0gbmV3IE1hcCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gaHR0cFBsdWdpbigpOiBQbHVnaW4ge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiaHR0cC1wbHVnaW5cIixcbiAgICBlbmZvcmNlOiBcInByZVwiLFxuXHRcdGFzeW5jIHJlc29sdmVJZChpZCwgaW1wb3J0ZXIpIHtcblx0XHRcdGlmIChpbXBvcnRlciAmJiBpc0h0dHBQcm90b2NvbChpbXBvcnRlcikpIHtcblx0XHRcdFx0aWYgKGlkLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSkge1xuXHRcdFx0XHRcdHJldHVybiBpZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB7IHBhdGhuYW1lLCBwcm90b2NvbCwgaG9zdCB9ID0gbmV3IFVSTChpbXBvcnRlcik7XG5cdFx0XHRcdC8vIGZvciBza3lwYWNrXG5cdFx0XHRcdGlmIChpZC5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0XHRcdHJldHVybiBgJHtwcm90b2NvbH0vLyR7aG9zdH0ke2lkfWA7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaWQuc3RhcnRzV2l0aChcIi5cIikpIHtcblx0XHRcdFx0XHRjb25zdCByZXNvbHZlZFBhdGhuYW1lID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShwYXRobmFtZSksIGlkKTtcblx0XHRcdFx0XHRjb25zdCBuZXdJZCA9IGAke3Byb3RvY29sfS8vJHtob3N0fSR7cmVzb2x2ZWRQYXRobmFtZX1gO1xuXHRcdFx0XHRcdHJldHVybiBuZXdJZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpc0h0dHBQcm90b2NvbChpZCkpIHtcblx0XHRcdFx0cmV0dXJuIGlkO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YXN5bmMgbG9hZChpZCkge1xuXHRcdFx0aWYgKGlkID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChpc0h0dHBQcm90b2NvbChpZCkpIHtcblx0XHRcdFx0Y29uc3QgY2FjaGVkID0gY2FjaGUuZ2V0KGlkKTtcblx0XHRcdFx0aWYgKGNhY2hlZCkge1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgZmV0Y2goaWQpO1xuXHRcdFx0XHRpZiAoIXJlcy5vaykge1xuXHRcdFx0XHRcdHRocm93IHJlcy5zdGF0dXNUZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGNvZGUgPSBhd2FpdCByZXMudGV4dCgpO1xuXHRcdFx0XHRjYWNoZS5zZXQoaWQsIGNvZGUpO1xuXHRcdFx0XHRyZXR1cm4gY29kZTtcblx0XHRcdH1cblx0XHR9LFxuXHR9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL2FkYXB0b3JzL2Nsb3VkZmxhcmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW50ZW4vZGV2L3ZwYi9zcmMvYWRhcHRvcnMvY2xvdWRmbGFyZS9pbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmVudGVuL2Rldi92cGIvc3JjL2FkYXB0b3JzL2Nsb3VkZmxhcmUvaW5kZXgudHNcIjtpbXBvcnQgeyBBZGFwdG9yIH0gZnJvbSBcIi4uL2luZGV4XCI7XG5pbXBvcnQgeyBub2RlbGVzcyB9IGZyb20gXCJ1bmVudlwiO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzL3Byb21pc2VzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IChvcHRpb25zOiB7XG5cdG5hbWU/OiBzdHJpbmc7XG59ID0ge30pID0+IFxuXHRBZGFwdG9yKHtcblx0XHRuYW1lOiBcImNsb3VkZmxhcmVcIixcblx0XHRydW50aW1lOiBqb2luKGRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKSwgXCJlbnRyeVwiKSxcblx0XHRvdXREaXI6IFwiY2xvdWRmbGFyZS9cIixcblx0XHRzZXJ2ZXJEaXI6IFwiY2xvdWRmbGFyZS9zZXJ2ZXJcIixcblx0XHRwdWJsaWNEaXI6IFwiY2xvdWRmbGFyZS9wdWJsaWNcIixcblx0XHRlbnRyeU5hbWU6IFwiaW5kZXhcIixcblx0XHQvLyBpbmxpbmVEeW5hbWljSW1wb3J0czogdHJ1ZSxcblx0XHRlbnY6IG5vZGVsZXNzLFxuXHRcdG9uQnVpbGQ6IGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IGZzLndyaXRlRmlsZShcImNsb3VkZmxhcmUvd3JhbmdsZXIudG9tbFwiLCBgXG5uYW1lID0gXCIke29wdGlvbnMubmFtZSB8fCBcImdhaWlhYS12aXRlLWNsb3VkZmxhcmVcIn1cIlxubWFpbiA9IFwic2VydmVyL2luZGV4LmpzXCJcbmFzc2V0cyA9IFwicHVibGljXCJcbm5vLWJ1bmRsZSA9IFwidHJ1ZVwiXG5jb21wYXRpYmlsaXR5X2RhdGUgPSBcIjIwMjItMDctMTJcIlxuYC50cmltKCkpXG5cdFx0fVxuXHR9KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1IsU0FBUyxvQkFBb0I7OztBQ0E1RCxPQUFPLFVBQVU7OztBQ0VwUSxJQUFNLGNBQWM7QUFXYixTQUFTLFlBS2Q7QUFDRCxRQUFNLE1BQU0sb0JBQUksSUFBbUI7QUFDbkMsUUFBTSxNQUFNLENBQUMsV0FBa0IsSUFBSSxJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUc7QUFDM0QsUUFBTSxTQUFTLENBQUNBLFVBQWlCLElBQUksT0FBT0EsS0FBSTtBQUNoRCxRQUFNLE1BQU0sQ0FBQ0EsVUFBaUIsSUFBSSxJQUFJQSxLQUFJO0FBQzFDLFNBQU87QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBQ0Q7QUFzQk8sU0FBUyxVQUFVLFFBQXFDO0FBQzlELFFBQU0sRUFBRSxJQUFJLElBQUk7QUFDaEIsUUFBTSxXQUFXO0FBQ2pCLFFBQU0sa0JBQWtCO0FBRXhCLFNBQU87QUFBQSxJQUNOLE1BQU0sR0FBRyxXQUFXO0FBQUEsSUFDcEIsU0FBUztBQUFBLElBQ1QsUUFBUSxDQUFDQyxZQUFXO0FBQ25CLGFBQU87QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNSLE9BQU87QUFBQSxZQUNOLENBQUMsUUFBUSxHQUFHO0FBQUEsVUFDYjtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLElBQ0EsVUFBVSxJQUFJO0FBQ2IsVUFBSSxHQUFHLFdBQVcsZUFBZSxHQUFHO0FBQ25DLGVBQU8sT0FBTztBQUFBLE1BQ2Y7QUFBQSxJQUNEO0FBQUEsSUFDQSxNQUFNLEtBQUssSUFBSSxLQUFLO0FBQ25CLFVBQUksR0FBRyxXQUFXLE9BQU8sZUFBZSxHQUFHO0FBQzFDLGNBQU1DLFFBQU8sR0FBRyxRQUFRLE9BQU8saUJBQWlCLEVBQUU7QUFDbEQsY0FBTSxPQUFPLElBQUksSUFBSUEsS0FBSTtBQUN6QixZQUFJLENBQUM7QUFBTSxpQkFBTztBQUNsQixjQUFNLFVBQVUsS0FBSyxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDckQsY0FBTSxJQUFJLE9BQU8sV0FBVyxLQUFLLFdBQVc7QUFDNUMsZUFBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNEOzs7QUNwRmdRLElBQU1DLGVBQWM7OztBQ0FPLFNBQVMsU0FBUyxZQUFZOzs7QUNrQmxULElBQU0sVUFBVSxDQUFJLFdBQTZCOzs7QURoQnhELFNBQVMsWUFBWTtBQUNyQixTQUFTLHFCQUFxQjtBQUhrSixJQUFNLDJDQUEyQztBQUtqTyxJQUFPLGVBQVEsTUFBTSxRQUFRO0FBQUEsRUFDM0IsTUFBTTtBQUFBLEVBQ04sU0FBUyxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDLEdBQUcsT0FBTztBQUFBLEVBQzlELFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFBQSxFQUNYLFdBQVc7QUFBQSxFQUNYLFdBQVc7QUFBQSxFQUNYLEtBQUs7QUFDUCxDQUFDOzs7QUh5Qk0sU0FBUyxlQUFlLFFBQXVCO0FBQ3JELFNBQU8sS0FBdUMsUUFBUTtBQUFBLElBQ3JELFNBQVMsYUFBWTtBQUFBLElBQ3JCLE9BQU87QUFBQSxJQUNQLEtBQUssVUFBVTtBQUFBLElBQ2YsUUFBUTtBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1IsV0FBVztBQUFBLFFBQ1gsVUFBVTtBQUFBLE1BQ1g7QUFBQSxJQUNEO0FBQUEsSUFDQSxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2hCLFlBQVk7QUFBQSxNQUNWLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDSCxDQUFDO0FBQ0Y7QUE2Qk8sU0FBUyxhQUFhLFFBQXFDO0FBQ2pFLFNBQU87QUFBQSxJQUNOLE1BQU0sR0FBR0MsWUFBVztBQUFBLElBQ3BCLFNBQVM7QUFBQSxJQUNULFFBQVEsTUFBTTtBQUViLGFBQU87QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLFNBQVM7QUFBQSxNQUNWO0FBQUEsSUFDRDtBQUFBLElBQ0EsZ0JBQWdCLENBQUMsZUFBZTtBQUMvQixhQUFPLE9BQU8sV0FBVztBQUN6QixhQUFPLE9BQU8sV0FBVyxXQUFXO0FBQUEsSUFDckM7QUFBQSxFQUNEO0FBQ0Q7OztBS25HQSxTQUFTLG9CQUFvQjs7O0FDRjhPLFNBQWtCLFlBQVk7QUFHbFMsU0FBUyxXQUFXO0FBQ3pCLFNBQU8sSUFBSSxTQUFTLGFBQWEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUNsRDtBQTRCQSxJQUFNLFNBQU4sTUFBYTtBQUFBLEVBQ1gsT0FBTyxJQUFJLEtBQUs7QUFBQSxFQUNoQixnQkFBZ0IsT0FBTyxHQUFZLFlBQWlCO0FBQ2xELFFBQUk7QUFDRixZQUFNLFNBQVMsTUFBTSxRQUFRLEVBQUUsSUFBSSxHQUFHO0FBQ3RDLFVBQUksa0JBQWtCO0FBQVUsZUFBTztBQUN2QyxVQUFJLE9BQU8sV0FBVztBQUFVLGVBQU8sRUFBRSxLQUFLLE1BQU07QUFDcEQsVUFBSSxPQUFPLFdBQVc7QUFBVSxlQUFPLEVBQUUsS0FBSyxNQUFNO0FBQ3BELFVBQUksa0JBQWtCLGdCQUFnQjtBQUNwQyxlQUFPLElBQUksU0FBUyxRQUFRO0FBQUEsVUFDMUIsU0FBUztBQUFBLFlBQ1AsZ0JBQWdCO0FBQUEsVUFDbEI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQ0EsVUFBSSxrQkFBa0IsYUFBYTtBQUNqQyxlQUFPLElBQUksU0FBUyxRQUFRO0FBQUEsVUFDMUIsU0FBUztBQUFBLFlBQ1AsZ0JBQWdCO0FBQUEsVUFDbEI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQ0EsVUFBSSxrQkFBa0IsTUFBTTtBQUMxQixlQUFPLElBQUksU0FBUyxRQUFRO0FBQUEsVUFDMUIsU0FBUztBQUFBLFlBQ1AsZ0JBQWdCO0FBQUEsVUFDbEI7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQ0EsVUFBSSxrQkFBa0IsT0FBTztBQUMzQixZQUFJLE1BQU0sV0FBVyxPQUFPLE9BQU87QUFDbkMsZUFBTyxFQUFFLEtBQUssRUFBRSxPQUFPLE9BQU8sUUFBUSxHQUFHLEdBQUc7QUFBQSxNQUM5QztBQUNBLGFBQU8sSUFBSSxTQUFTLE1BQU07QUFBQSxJQUM1QixTQUFTLEdBQUc7QUFDVixVQUFJLGFBQWEsT0FBTztBQUN0QixZQUFJLE1BQU0sV0FBVyxFQUFFLE9BQU87QUFDOUIsZUFBTyxFQUFFLEtBQUsseUJBQXlCLEdBQUc7QUFBQSxNQUM1QztBQUNBLFVBQUksYUFBYSxVQUFVO0FBQ3pCLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUNBLFdBQU8sSUFBSSxTQUFTLHlCQUF5QixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLE1BQU0sQ0FBQ0MsT0FBYyxZQUFpQztBQUNwRCxTQUFLLEtBQUssSUFBSUEsT0FBTSxDQUFDLE1BQU07QUFDekIsYUFBTyxLQUFLLGNBQWMsR0FBRyxPQUFPO0FBQUEsSUFDdEMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU8sQ0FBQ0EsT0FBYyxZQUFpQztBQUNyRCxTQUFLLEtBQUssS0FBS0EsT0FBTSxPQUFPLE1BQU07QUFDaEMsYUFBTyxLQUFLLGNBQWMsR0FBRyxPQUFPO0FBQUEsSUFDdEMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE1BQU0sQ0FBQ0EsT0FBYyxZQUFpQztBQUNwRCxTQUFLLEtBQUssSUFBSUEsT0FBTSxPQUFPLE1BQU07QUFDL0IsYUFBTyxLQUFLLGNBQWMsR0FBRyxPQUFPO0FBQUEsSUFDdEMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVEsQ0FBQ0EsT0FBYyxZQUFpQztBQUN0RCxTQUFLLEtBQUssTUFBTUEsT0FBTSxPQUFPLE1BQU07QUFDakMsYUFBTyxLQUFLLGNBQWMsR0FBRyxPQUFPO0FBQUEsSUFDdEMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVMsQ0FBQ0EsT0FBYyxZQUFpQztBQUN2RCxTQUFLLEtBQUssT0FBT0EsT0FBTSxPQUFPLE1BQU07QUFDbEMsYUFBTyxLQUFLLGNBQWMsR0FBRyxPQUFPO0FBQUEsSUFDdEMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxTQUFTLEtBQUssS0FBSztBQUFBLEVBQ25CLGNBQWM7QUFDWixTQUFLLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUk7QUFDdkMsU0FBSyxRQUFRLEtBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJO0FBQzNDLFNBQUssT0FBTyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSTtBQUN6QyxTQUFLLFFBQVEsS0FBSyxLQUFLLE1BQU0sS0FBSyxLQUFLLElBQUk7QUFBQSxFQUM3QztBQUNGOzs7QUNyR0EsU0FBUyxZQUFZO0FBQ3JCLFNBQVMsZ0JBQWdCO0FBRXpCLFNBQVMsMEJBQTBCOzs7QUNoQndPLElBQU0saUJBQU4sY0FBNkIsTUFBTTtBQUFBLEVBQzdTLFlBQVksU0FBa0I7QUFDN0IsVUFBTSxPQUFPO0FBQ2IsU0FBSyxPQUFPO0FBQUEsRUFDYjtBQUNEO0FBU08sU0FBUyxPQUFPLE9BQVksU0FBa0I7QUFDcEQsTUFBSSxVQUFVLFNBQVMsVUFBVSxRQUFRLE9BQU8sVUFBVSxhQUFhO0FBQ3RFLFVBQU0sSUFBSSxlQUFlLE9BQU87QUFBQSxFQUNqQztBQUNDLFNBQU87QUFDVDs7O0FDbEJBLFNBQVMsY0FBYztBQWdFaEIsSUFBTSxtQ0FBbUMsQ0FDNUMsV0FDQztBQUNELE1BQUksT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNoQyxNQUFJLFNBQVMsSUFBSSxlQUFlLE1BQU0sSUFBSTtBQUMxQyxTQUFPO0FBQ1g7QUFFQSxJQUFNLGFBQU4sTUFBaUI7QUFBQSxFQUNOO0FBQUEsRUFDQTtBQUFBLEVBQ0M7QUFBQSxFQU9BO0FBQUEsRUFFUixZQUNJLFFBT0Y7QUFDRSxTQUFLLGdCQUNELE9BQU8seUJBQ1AsSUFBSSxPQUFPLFNBQVMsRUFBRTtBQUMxQixTQUFLLGtCQUFrQjtBQUN2QixTQUFLLFNBQVM7QUFDZCxTQUFLLFVBQVUsS0FBSyxRQUFRLEtBQUssSUFBSTtBQUNyQyxTQUFLLFFBQVEsS0FBSyxNQUFNLEtBQUssSUFBSTtBQUNqQyxTQUFLLFFBQVEsS0FBSyxNQUFNLEtBQUssSUFBSTtBQUFBLEVBQ3JDO0FBQUEsRUFFQSxLQUFLLE9BQW1CO0FBQ3BCLFdBQU8sT0FBTyxjQUFjO0FBQUEsRUFDaEM7QUFBQSxFQUVBLE1BQU0sWUFBa0Q7QUFDcEQsU0FBSyxhQUFhO0FBQ2xCLFNBQUssT0FBTyxHQUFHLFFBQVEsS0FBSyxPQUFPO0FBQ25DLFNBQUssT0FBTyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQ3BDLFNBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQ2xDLFNBQUssT0FBTyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDeEM7QUFBQSxFQUVBLE9BQU87QUFDSCxTQUFLLE9BQU87QUFBQSxFQUNoQjtBQUFBLEVBRUEsT0FBTyxRQUFnQjtBQUNuQixRQUFJLEtBQUssT0FBTyxTQUFTO0FBQ3JCLFdBQUssT0FBTyxRQUFRLE1BQU07QUFBQSxJQUM5QjtBQUVBLFNBQUssT0FBTyxJQUFJLFFBQVEsS0FBSyxPQUFPO0FBQ3BDLFNBQUssT0FBTyxJQUFJLFNBQVMsS0FBSyxLQUFLO0FBQ25DLFNBQUssT0FBTyxJQUFJLE9BQU8sS0FBSyxLQUFLO0FBQ2pDLFNBQUssT0FBTyxJQUFJLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDdkM7QUFBQSxFQUVBLFFBQVEsT0FBNEI7QUFDaEMsUUFBSSxLQUFLLFlBQVk7QUFDakIsVUFBSTtBQUNBLFlBQUksUUFBUSxpQkFBaUIsYUFBYSxRQUFRLE9BQU8sS0FBSyxLQUFLO0FBRW5FLFlBQUksYUFBYSxLQUFLLFdBQVcsZUFBZSxLQUFLLE1BQU07QUFDM0QsYUFBSyxXQUFXLFFBQVEsS0FBSztBQUM3QixZQUFJLGFBQWEsR0FBRztBQUNoQixlQUFLLE1BQU07QUFBQSxRQUNmO0FBQUEsTUFDSixTQUFTLE9BQVk7QUFDakIsYUFBSyxXQUFXO0FBQUEsVUFDWixJQUFJO0FBQUEsWUFDQTtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQ0EsYUFBSyxPQUFPO0FBQUEsTUFDaEI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsUUFBUTtBQUNKLFFBQUksS0FBSyxPQUFPLE9BQU87QUFDbkIsV0FBSyxPQUFPLE1BQU07QUFBQSxJQUN0QjtBQUFBLEVBQ0o7QUFBQSxFQUVBLFNBQVM7QUFDTCxRQUFJLEtBQUssT0FBTyxZQUFZLEtBQUssT0FBTyxRQUFRO0FBQzVDLFdBQUssT0FBTyxPQUFPO0FBQUEsSUFDdkI7QUFBQSxFQUNKO0FBQUEsRUFFQSxRQUFRO0FBQ0osUUFBSSxLQUFLLFlBQVk7QUFDakIsV0FBSyxXQUFXLE1BQU07QUFDdEIsYUFBTyxLQUFLO0FBQUEsSUFDaEI7QUFBQSxFQUNKO0FBQUEsRUFFQSxNQUFNLE9BQWM7QUFDaEIsUUFBSSxLQUFLLFlBQVk7QUFDakIsV0FBSyxXQUFXLE1BQU0sS0FBSztBQUMzQixhQUFPLEtBQUs7QUFBQSxJQUNoQjtBQUFBLEVBQ0o7QUFDSjs7O0FGM0pBLFNBQVMsY0FBYyxnQkFBcUM7QUFDM0QsTUFBSSxVQUFVLElBQUksUUFBUTtBQUUxQixXQUFTLENBQUMsS0FBSyxNQUFNLEtBQUssT0FBTyxRQUFRLGNBQWMsR0FBRztBQUN6RCxRQUFJLFFBQVE7QUFDWCxVQUFJLE1BQU0sUUFBUSxNQUFNLEdBQUc7QUFDMUIsaUJBQVMsU0FBUyxRQUFRO0FBQ3pCLGtCQUFRLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDMUI7QUFBQSxNQUNELE9BQU87QUFDTixnQkFBUSxJQUFJLEtBQUssTUFBTTtBQUFBLE1BQ3hCO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFFQSxTQUFPO0FBQ1I7QUFHQSxTQUFTLGNBQWMsS0FBc0IsS0FBOEI7QUFDMUUsTUFBSSxTQUNILElBQUksUUFBUSxVQUFVLFdBQVcsSUFBSSxRQUFRLFNBQzFDLElBQUksUUFBUSxTQUNaLFVBQVUsSUFBSSxRQUFRLElBQUk7QUFDOUIsU0FBTyxJQUFJLEtBQUssa0NBQWtDO0FBQ2xELE1BQUksTUFBTSxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU07QUFFakMsTUFBSSxPQUFvQjtBQUFBLElBQ3ZCLFFBQVEsSUFBSTtBQUFBLElBQ1osU0FBUyxjQUFjLElBQUksT0FBTztBQUFBLEVBQ25DO0FBRUEsTUFBSSxJQUFJLFdBQVcsU0FBUyxJQUFJLFdBQVcsUUFBUTtBQUNsRCxTQUFLLE9BQU8saUNBQWlDLEdBQUc7QUFDaEQsSUFBQyxLQUE0QixTQUFTO0FBQUEsRUFDdkM7QUFFQSxTQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sSUFBSTtBQUNsQztBQUlBLGVBQWUsbUJBQW1CLFFBQWtCLEtBQXFCO0FBQ3hFLE1BQUksYUFBYSxPQUFPO0FBQ3hCLE1BQUksZ0JBQWdCLE9BQU87QUFFM0IsTUFBSSxpQkFBaUIsQ0FBQztBQUV0QixXQUFTLENBQUMsTUFBTSxLQUFLLEtBQUssT0FBTyxTQUFTO0FBQ3pDLFFBQUksU0FBUyxjQUFjO0FBQzFCLHFCQUFlLEtBQUssR0FBRyxtQkFBbUIsS0FBSyxDQUFDO0FBQUEsSUFDakQ7QUFBTyxVQUFJLFVBQVUsTUFBTSxLQUFLO0FBQUEsRUFDakM7QUFFQSxNQUFJLGVBQWUsUUFBUTtBQUMxQixRQUFJLFVBQVUsY0FBYyxjQUFjO0FBQUEsRUFDM0M7QUFFQSxNQUFJLE9BQU8sTUFBTTtBQUVoQixRQUFJLGVBQWUsT0FBTztBQUMxQixRQUFJLFdBQVcsU0FBUyxLQUFLLFlBQVk7QUFDekMsYUFBUyxLQUFLLEdBQUc7QUFDakIsVUFBTSxLQUFLLFVBQVUsS0FBSztBQUFBLEVBQzNCLE9BQU87QUFDTixRQUFJLElBQUk7QUFBQSxFQUNUO0FBQ0Q7QUFFTyxJQUFNLG9CQUFvQixPQUNoQyxLQUNBLEtBQ0EsUUFDSTtBQUNILFFBQU0sVUFBVSxjQUFjLEtBQUssR0FBRztBQUN0QyxxQkFBbUIsTUFBTSxJQUFJLE1BQU0sT0FBTyxHQUFHLEdBQUc7QUFDbEQ7OztBRzdGQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxXQUFXO0FBRWhCLFNBQVMsZ0JBQWdCLFFBQXFDO0FBQ3BFLFNBQU87QUFBQSxJQUNOLE1BQU0sR0FBR0MsWUFBVztBQUFBLElBQ3BCLFNBQVM7QUFBQSxJQUNULGlCQUFpQixDQUFDLFdBQVc7QUFDNUIsYUFBTyxZQUFZO0FBQ2xCLGNBQU0sTUFBTSxJQUFJLE9BQU87QUFFdkIsWUFBSTtBQUNKLFlBQUk7QUFDSCxrQkFBUSxNQUFNLE9BQU87QUFBQSxZQUNkLFdBQUssT0FBTyxNQUFNLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxLQUFLO0FBQUEsVUFDckU7QUFBQSxRQUNELFNBQVMsR0FBRztBQUFBLFFBQUM7QUFDYixpQkFBUyxJQUFJLE1BQU0sS0FBSyxNQUFNLE9BQU87QUFFckMsWUFBSSxJQUFJLEtBQUssT0FBTyxNQUFNO0FBQ3pCLGdCQUFNLE1BQU0sTUFBUztBQUFBLFlBQ2QsV0FBSyxPQUFPLE1BQU8sWUFBWTtBQUFBLFlBQ3JDO0FBQUEsVUFDRDtBQUNBLGNBQUksQ0FBQyxLQUFLO0FBQ1Qsa0JBQU0sU0FBUztBQUFBLFVBQ2hCO0FBQ0EsaUJBQU8sSUFBSSxTQUFTLE1BQU0sT0FBTyxtQkFBbUIsRUFBRSxLQUFLLEdBQUcsR0FBRztBQUFBLFlBQ2hFLFNBQVM7QUFBQSxjQUNSLGdCQUFnQjtBQUFBLFlBQ2pCO0FBQUEsVUFDRCxDQUFDO0FBQUEsUUFDRixDQUFDO0FBQ0QsZUFBTyxZQUFZLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztBQUMxQyxjQUFJLElBQUksS0FBSyxXQUFXLE9BQU8sR0FBRztBQUNqQyxtQkFBTyxLQUFLO0FBQUEsVUFDYjtBQUNBLDRCQUFrQixLQUFLLEtBQUssR0FBRztBQUFBLFFBQ2hDLENBQUM7QUFBQSxNQUNGO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRDs7O0FDL0NpUCxZQUFZLFVBQVU7QUFHdlEsWUFBWUMsU0FBUTtBQUNwQixZQUFZQyxZQUFXOzs7QUNIdkIsT0FBTyxVQUFVO0FBT2pCLFNBQVMsZUFBZSxJQUErQjtBQUN0RCxTQUFPLElBQUksV0FBVyxTQUFTLEtBQUssSUFBSSxXQUFXLFVBQVU7QUFDOUQ7QUFFQSxJQUFNLFFBQVEsb0JBQUksSUFBSTtBQUVmLFNBQVMsYUFBcUI7QUFDcEMsU0FBTztBQUFBLElBQ04sTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1gsTUFBTSxVQUFVLElBQUksVUFBVTtBQUM3QixVQUFJLFlBQVksZUFBZSxRQUFRLEdBQUc7QUFDekMsWUFBSSxHQUFHLFdBQVcsVUFBVSxHQUFHO0FBQzlCLGlCQUFPO0FBQUEsUUFDUjtBQUNBLGNBQU0sRUFBRSxVQUFVLFVBQVUsS0FBSyxJQUFJLElBQUksSUFBSSxRQUFRO0FBRXJELFlBQUksR0FBRyxXQUFXLEdBQUcsR0FBRztBQUN2QixpQkFBTyxHQUFHLFFBQVEsS0FBSyxJQUFJLEdBQUcsRUFBRTtBQUFBLFFBQ2pDLFdBQVcsR0FBRyxXQUFXLEdBQUcsR0FBRztBQUM5QixnQkFBTSxtQkFBbUIsS0FBSyxLQUFLLEtBQUssUUFBUSxRQUFRLEdBQUcsRUFBRTtBQUM3RCxnQkFBTSxRQUFRLEdBQUcsUUFBUSxLQUFLLElBQUksR0FBRyxnQkFBZ0I7QUFDckQsaUJBQU87QUFBQSxRQUNSO0FBQUEsTUFDRCxXQUFXLGVBQWUsRUFBRSxHQUFHO0FBQzlCLGVBQU87QUFBQSxNQUNSO0FBQUEsSUFDRDtBQUFBLElBQ0EsTUFBTSxLQUFLLElBQUk7QUFDZCxVQUFJLE9BQU8sTUFBTTtBQUNoQjtBQUFBLE1BQ0Q7QUFDQSxVQUFJLGVBQWUsRUFBRSxHQUFHO0FBQ3ZCLGNBQU0sU0FBUyxNQUFNLElBQUksRUFBRTtBQUMzQixZQUFJLFFBQVE7QUFDWCxpQkFBTztBQUFBLFFBQ1I7QUFDQSxjQUFNLE1BQU0sTUFBTSxNQUFNLEVBQUU7QUFDMUIsWUFBSSxDQUFDLElBQUksSUFBSTtBQUNaLGdCQUFNLElBQUk7QUFBQSxRQUNYO0FBQ0EsY0FBTSxPQUFPLE1BQU0sSUFBSSxLQUFLO0FBQzVCLGNBQU0sSUFBSSxJQUFJLElBQUk7QUFDbEIsZUFBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNEOzs7QURoRE8sU0FBUyxZQUFZLFFBQXFDO0FBQy9ELFNBQU87QUFBQSxJQUNMLE1BQU0sR0FBR0MsWUFBVztBQUFBLElBQ3BCLFNBQVM7QUFDUCxhQUFPO0FBQUEsUUFDTCxPQUFPO0FBQUEsVUFDTCxRQUFRLE9BQU8sUUFBUTtBQUFBLFVBQ3ZCLFVBQVU7QUFBQSxRQUNaO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUNmLGFBQU8sSUFBSSxJQUFJO0FBQUEsUUFDYixNQUFNO0FBQUEsUUFDTixTQUFTLFlBQ1Asb0JBQ1E7QUFBQSxVQUNKLE9BQU87QUFBQSxVQUNQLE9BQU8sT0FBTztBQUFBLFVBQ2QsT0FBTyxPQUFPO0FBQUEsUUFDaEIsQ0FDRjtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLGFBQWE7QUFBQSxNQUNYLFlBQVk7QUFBQSxNQUNaLFNBQVMsWUFBWTtBQUVuQixZQUFJLFdBQVc7QUFBbUI7QUFFbEMsbUJBQVcsb0JBQW9CO0FBQy9CLGNBQVcsV0FBTTtBQUFBLFVBQ2YsU0FBUztBQUFBLFlBQ1AsV0FBVztBQUFBLFlBQ1g7QUFBQSxjQUNFLE1BQU0sR0FBR0EsWUFBVztBQUFBLGNBQ3BCLFFBQVEsT0FBTztBQUFBLGdCQUNiLE9BQU87QUFBQSxrQkFDTCxRQUFRLE9BQU8sUUFBUTtBQUFBLGtCQUN2QixVQUFVO0FBQUEsZ0JBQ1o7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFNBQVM7QUFBQSxVQUNULEtBQUs7QUFBQSxZQUNILFlBQVk7QUFBQSxVQUNkO0FBQUEsVUFDQSxPQUFPO0FBQUEsWUFDTCxLQUFLO0FBQUEsWUFDTCxhQUFhO0FBQUEsWUFDYixlQUFlO0FBQUEsY0FDYixRQUFRO0FBQUEsZ0JBQ04sZ0JBQWdCO0FBQUEsZ0JBQ2hCLHNCQUFzQixPQUFPLFFBQVE7QUFBQSxjQUN2QztBQUFBLGNBQ0EsT0FBTztBQUFBLGdCQUNMLENBQUMsT0FBTyxRQUFRLGFBQWEsT0FBTyxHQUFHLE9BQU8sUUFBUTtBQUFBLGNBQ3hEO0FBQUEsY0FDQSxVQUFVLE9BQU8sUUFBUSxLQUFLO0FBQUEsWUFDaEM7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBQ0QsUUFBRztBQUFBLFVBQ0ssWUFBSyxPQUFPLFFBQVEsV0FBVyxlQUFlO0FBQUEsVUFDOUMsWUFBSyxPQUFPLFFBQVEsV0FBVyxzQkFBc0I7QUFBQSxRQUM3RDtBQUNBLFFBQU0sWUFBSyxPQUFPLFFBQVEsV0FBVyxlQUFlO0FBQ3BELGVBQU8sUUFBUSxXQUFZLE1BQU0sT0FBTyxRQUFRLFFBQVE7QUFDeEQsUUFBRztBQUFBLFVBQ0ssWUFBSyxPQUFPLFFBQVEsUUFBUSxZQUFZO0FBQUEsVUFDOUMsS0FBSyxVQUFVO0FBQUEsWUFDYixRQUFjO0FBQUEsY0FDWixPQUFPLFFBQVE7QUFBQSxjQUNmLE9BQU8sUUFBUSxZQUFZO0FBQUEsWUFDN0I7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBTi9FTyxJQUFNLE1BQU0sYUFBYTtBQUFBLEVBQy9CLE1BQU1DO0FBQUEsRUFDTixPQUFPO0FBQ1IsQ0FBQztBQUVjLFNBQVIsT0FBd0IsUUFBc0M7QUFFcEUsUUFBTSxNQUFNLGVBQWUsVUFBVSxDQUFDLENBQUM7QUFDdkMsTUFBSSxTQUFTLElBQUksUUFBUSxJQUFJLENBQUM7QUFFOUIsU0FBTztBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsYUFBYSxHQUFHO0FBQUEsSUFDaEIsVUFBVSxHQUFHO0FBQUEsSUFDYixnQkFBZ0IsR0FBRztBQUFBLElBQ25CLFlBQVksR0FBRztBQUFBLEVBQ2hCO0FBQ0Q7OztBUXpCQSxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLGlCQUFBQyxzQkFBcUI7QUFDOUIsU0FBUyxXQUFBQyxVQUFTLFFBQUFDLGFBQVk7QUFDOUIsWUFBWUMsU0FBUTtBQUp3SyxJQUFNQyw0Q0FBMkM7QUFNN08sSUFBTyxxQkFBUSxDQUFDLFVBRVosQ0FBQyxNQUNKLFFBQVE7QUFBQSxFQUNQLE1BQU07QUFBQSxFQUNOLFNBQVNDLE1BQUtDLFNBQVFDLGVBQWNILHlDQUFlLENBQUMsR0FBRyxPQUFPO0FBQUEsRUFDOUQsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsV0FBVztBQUFBLEVBQ1gsV0FBVztBQUFBO0FBQUEsRUFFWCxLQUFLO0FBQUEsRUFDTCxTQUFTLFlBQVk7QUFDcEIsVUFBUyxjQUFVLDRCQUE0QjtBQUFBLFVBQ3hDLFFBQVEsUUFBUSx3QkFBd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS2hELEtBQUssQ0FBQztBQUFBLEVBQ047QUFDRCxDQUFDOzs7QWRyQkYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLE9BQVE7QUFBQSxJQUNqQixPQUFPO0FBQUEsSUFDUCxTQUFTLG1CQUFXO0FBQUEsRUFDckIsQ0FBQyxDQUFDO0FBQUEsRUFDRixRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiY29uZmlnIiwgInBhdGgiLCAiUExVR0lOX05BTUUiLCAiUExVR0lOX05BTUUiLCAicGF0aCIsICJQTFVHSU5fTkFNRSIsICJmcyIsICJwYXRoZSIsICJQTFVHSU5fTkFNRSIsICJQTFVHSU5fTkFNRSIsICJmaWxlVVJMVG9QYXRoIiwgImRpcm5hbWUiLCAiam9pbiIsICJmcyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImpvaW4iLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
