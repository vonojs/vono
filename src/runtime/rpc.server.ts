// @ts-expect-error - virtual import
import entry from "#vono/internal/server.entry";

import { hc } from "hono/client";

export default hc("/", {
  fetch: entry.request,
});
