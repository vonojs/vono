import { BuildOptions, Manifest, Plugin } from "vite";
import * as fs from "fs/promises";

const reactRefresh = 
`export const reactRefresh = \`import RefreshRuntime from '/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true\`
`

function createDevManifest(
  rollupOptions: BuildOptions["rollupOptions"],
): Manifest {
  const entries = rollupOptions?.input ?? {};
  if (Array.isArray(entries)) {
    return entries.reduce((manifest, entry) => {
      manifest[entry] = {
        file: entry,
        isEntry: true,
        src: entry,
      };
      return manifest;
    }, {} as Manifest);
  }
  if (typeof entries === "object") {
    return Object.entries(entries).reduce((manifest, [, entry]) => {
      manifest[entry] = {
        file: entry,
        isEntry: true,
        src: entry,
      };
      return manifest;
    }, {} as Manifest);
  }
  return {};
}

async function getBuildManifest(path: string) {
  const manifestRaw = await fs.readFile(path, "utf-8");
  const manifest = JSON.parse(manifestRaw);
  if (!manifest) {
    throw new Error("Build manifest not found at " + path);
  }
  return manifest;
}

export default function manifest(config: {
  manifest: string | (() => string);
}): Plugin {
  let manifest: Manifest = {};
  let devScripts: string;
  return {
    name: "vono:manifest",
    config: () => ({
      resolve: {
        alias: {
          "#manifest": "virtual:manifest",
        },
      },
    }),
    configResolved: async (vite) => {
      const isBuild = vite.mode === "production";
      if (isBuild) {
        const path = typeof config.manifest === "function"
          ? config.manifest()
          : config.manifest;
        manifest = await getBuildManifest(path);
        devScripts = `export const devScripts = [];`
      } else {
        manifest = createDevManifest(vite.build?.rollupOptions);
        devScripts = `export const devScripts = ["/@vite/client"];`
      }
    },
    resolveId: (id) => {
      if (id === "virtual:manifest") {
        return "\0" + id;
      }
    },
    load: async (id) => {
      if (id === "\0virtual:manifest") {
        return `export default ${JSON.stringify(manifest)};\n${devScripts}\n${reactRefresh}`;
      }
    },
  };
}
