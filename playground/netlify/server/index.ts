/// <reference path="../../../src/server.ts" />

import html from "#vono/html"

export default  () => {
	return new Response(html.replace("%title%", "Vono Playground"), {
		headers: {
			"Content-Type": "text/html"
		}
	})
}
