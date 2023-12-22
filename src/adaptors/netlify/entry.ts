import { Server } from "../../server";
// @ts-ignore - this is a generated file
import entry from "#server/internal/server.entry"

const server = new Server();
server.route("/", entry);

export default server.fetch

export const config = {
  path: "*"
}