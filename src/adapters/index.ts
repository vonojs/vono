import node from "./node";
import nodeServer from "./node-server";
import cloudflare from "./cloudflare";
import cloudflarePages from "./cloudflare-pages";
import deno from "./deno";
import netlify from "./netlify";
import bun from "./bun";

export type Adapter = {
  name: string;
  runtime: string;
  outDir: string;
  serverDir: string;
  publicDir: string;
  entryName: string;
  entryDir?: string;
  inlineDynamicImports?: boolean;
  env?: {
    alias?: Record<string, string>;
    external?: string[];
    inject?: Record<string, string | string[]>;
    polyfill?: string[];
  };
  onBuild?: () => void | Promise<void>;
};

export const createAdapter = <T>(target: Adapter): Adapter => target;
export const extendAdapter = (
  target: Adapter,
  extend: Partial<Adapter>,
): Adapter => {
  return {
    ...target,
    ...extend,
    onBuild: async () => {
      await target.onBuild?.();
      await extend.onBuild?.();
    },
  };
};

export { node, cloudflare, cloudflarePages, deno, netlify, bun, nodeServer };
