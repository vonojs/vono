/// <reference types="../../src/server" />

import html from "#vono/html"

export default {
	fetch: () => {
		console.log(html)
		return new Response("WOO")
		// return new Response(html.replace("%title%", "Vono Playground"), {
		// 	headers: {
		// 		"Content-Type": "text/html"
		// 	}
		// })
	}
}