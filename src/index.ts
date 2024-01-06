import vono from "./vite";

declare global {
  var __vono: {
    servers: {
      path: string;
    }[];
  };
}

function registerServer(args: { path: string }) {
  globalThis.__vono ??= {
    servers: [],
  };
  globalThis.__vono.servers.push(args);
}

export { registerServer };
export { useVFS } from "./vfs";
export default vono;
