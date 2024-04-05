import { BuildOptions, Manifest, Plugin } from "vite";
import * as fs from "fs/promises";
import { useVFS } from "../vfs";

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
  if (typeof entries === "string") {
    return {
      [entries]: {
        file: entries,
        isEntry: true,
        src: entries,
      },
    };
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
  const vfs = useVFS();
  return {
    name: "vono:manifest",
    enforce: "pre",
    configResolved: async (vite) => {
      const isBuild = vite.mode === "production";
      vfs.add({
        path: "/manifest",
        serverContent: async () => {
          if (isBuild) {
            const path =
              typeof config.manifest === "function"
                ? config.manifest()
                : config.manifest;
            return `export default ${JSON.stringify(
              await getBuildManifest(path),
            )};`;
          } else {
            return `export default ${JSON.stringify(
              createDevManifest(vite.build?.rollupOptions),
            )};`;
          }
        },
      });
    },
  };
}
