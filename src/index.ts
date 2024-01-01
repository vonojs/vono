import vono from "./vite";

declare global {
  var __vono: {
    servers: {
      path: string;
    }[];
  }
}

export function registerServer(args: {
  path: string;
}){
  globalThis.__vono ??= {
    servers: []
  };
  globalThis.__vono.servers.push(args);
}

export default vono;