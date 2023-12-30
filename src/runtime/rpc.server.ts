import entry from "#vono/internal/server.entry"

import { hc } from "hono/client"

export default hc(window.location.origin, {
  fetch: entry.fetch,
})