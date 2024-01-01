import node from "./node";
import cloudflare from "./cloudflare";
import deno from "./deno";
import netlify from "./netlify";

export type Adaptor = {
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
  },
  onBuild?: () => void | Promise<void>;
};

export const Adaptor = <T>(target: Adaptor): Adaptor => target;

export {
  node,
  cloudflare,
  deno,
  netlify
}