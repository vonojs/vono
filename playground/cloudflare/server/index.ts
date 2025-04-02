/// <reference types="../../../src/server" />

import html from "#vono/html"

export default {
	fetch: () => {
		return new Response(html.replace("%title%", "Vono Playground"), {
			headers: {
				"Content-Type": "text/html"
			}
		})
	}
}