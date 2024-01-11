import node from "./node";
import nodeServer from "./node-server";
import cloudflare from "./cloudflare";
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

export const Adapter = <T>(target: Adapter): Adapter => target;

export { node, cloudflare, deno, netlify, bun, nodeServer };
