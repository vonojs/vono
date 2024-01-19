import { Adapter, createAdapter } from "./adapters";
import { Hono } from "hono";
import { type VFS } from "./vfs";

export type Vono = {
  devServer?: Hono;
  root: string;
  vfs: VFS;
  mode?: "build" | "serve" | "dev";
  buildTarget?: "server" | "client";
  adapter: Adapter;
  server: {
    directory: string;
    entry: string;
  };
  prerender: {
    routes: Array<string> | (() => Array<string> | Promise<Array<string>>);
  };
  ssr: boolean;
  onBuild?: (vono: Vono) => void | Promise<void>;
};

export type UserConfig = {
  adapter?: Adapter;
  prerender?: {
    routes: Array<string> | (() => Array<string>);
  };
  onBuild?: (vono: Vono) => void | Promise<void>;
};

export function createVono(
  userConfig: UserConfig | undefined,
  options: {
    root: string;
    mode: "build" | "serve" | "dev";
    ssr: boolean;
    vfs: VFS;
    adapter: Adapter;
  },
): Vono {
  return {
    adapter: options.adapter,
    vfs: options.vfs,
    server: {
      directory: "server",
      entry: "index",
    },
    root: options.root,
    prerender: {
      routes: userConfig?.prerender?.routes ?? [],
    },
    ssr: options.ssr,
    onBuild: userConfig?.onBuild ?? (() => {}),
  };
}
