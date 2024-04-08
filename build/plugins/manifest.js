import * as fs from "fs/promises";
import { useVFS } from "../vfs.js";
import { join } from "node:path";
function createDevManifest(rollupOptions) {
  const entries = rollupOptions?.input ?? {};
  if (Array.isArray(entries)) {
    return entries.reduce((manifest2, entry) => {
      manifest2[entry] = {
        file: entry,
        isEntry: true,
        src: entry
      };
      return manifest2;
    }, {});
  }
  if (typeof entries === "object") {
    return Object.entries(entries).reduce((manifest2, [, entry]) => {
      manifest2[entry] = {
        file: entry,
        isEntry: true,
        src: entry
      };
      return manifest2;
    }, {});
  }
  if (typeof entries === "string") {
    return {
      [entries]: {
        file: entries,
        isEntry: true,
        src: entries
      }
    };
  }
  return {};
}
async function getBuildManifest(path) {
  const manifestRaw = await fs.readFile(path, "utf-8");
  const manifest2 = JSON.parse(manifestRaw);
  if (!manifest2) {
    throw new Error("Build manifest not found at " + path);
  }
  return manifest2;
}
function stripLeadingSlash(str) {
  return str.replace(/^\//, "");
}
export function moduleNodeToManifestChunk(node) {
  if (!node) {
    return {
      file: ""
    };
  }
  return {
    src: stripLeadingSlash(node.url),
    file: stripLeadingSlash(node.url),
    // @ts-ignore
    css: [...node.staticImportedUrls].filter(
      (url) => url.endsWith(".css")
    ).map(stripLeadingSlash),
    // @ts-ignore
    assets: [...node.staticImportedUrls].filter(
      (url) => !url.endsWith(".css")
    ).map(stripLeadingSlash)
  };
}
export default function manifest(config) {
  const vfs = useVFS();
  let server;
  return {
    name: "vono:manifest",
    enforce: "pre",
    configResolved: async (vite) => {
      const isBuild = vite.mode === "production";
      vfs.add({
        path: "/manifest",
        serverContent: async () => {
          if (isBuild) {
            const path = typeof config.manifest === "function" ? config.manifest() : config.manifest;
            return `export default ${JSON.stringify(
              await getBuildManifest(join(vite.build.outDir, path))
            )};`;
          } else {
            return `export default ${JSON.stringify(
              createDevManifest(vite.build.rollupOptions)
            )};`;
          }
        }
      });
    },
    configureServer(_server) {
      server = _server;
      server.middlewares.use(async (req, res, next) => {
        if (!req.originalUrl?.startsWith("/__fetch_asset")) {
          next();
          return;
        }
        const url = new URL(req.originalUrl, "http://localhost");
        const mod = url.searchParams.get("mod");
        if (!mod) {
          res.writeHead(400);
          res.end("mod query param is required");
          return;
        }
        const scripts = [];
        if (mod.endsWith("index.html")) {
          const parser = (await import("node-html-parser")).parse;
          const html = await fs.readFile(join(server.config.root, mod), "utf-8");
          await server.transformIndexHtml("/", html);
          const root = parser(html);
          for (const script of root.querySelectorAll("script")) {
            const src = script.getAttribute("src");
            if (src) {
              await server.warmupRequest(src);
              scripts.push(src);
            }
          }
        } else {
          await server.warmupRequest(mod);
          scripts.push(mod);
        }
        const chunks = [];
        for (const script of scripts) {
          const modNode = await server.moduleGraph.getModuleByUrl(script);
          if (!modNode) {
            continue;
          }
          ;
          chunks.push(moduleNodeToManifestChunk(modNode));
        }
        const result = {
          name: stripLeadingSlash(mod),
          file: stripLeadingSlash(mod),
          src: stripLeadingSlash(mod),
          css: chunks?.flatMap((chunk) => chunk.css ?? [])?.filter(Boolean),
          assets: chunks?.flatMap((chunk) => chunk.assets ?? [])?.filter(Boolean)
        };
        res.writeHead(200, { "content-type": "application/json" });
        res.write(JSON.stringify(result));
        res.end();
      });
    }
  };
}
