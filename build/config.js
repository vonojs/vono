import NodeAdaptor from "./adaptors/node/index.js";
export const createConfig = (config = {}) => {
  return {
    serverEntry: config.serverEntry || "src/server.entry",
    adaptor: config.adaptor || new NodeAdaptor(),
    includeIndexHtml: config.includeIndexHtml ?? false
  };
};
