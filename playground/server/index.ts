import html from "#vono/html"
import manifest from "#vono/manifest"

export default {
	fetch: () => {
		console.log(manifest)
		return new Response(html, {
			headers: {
				"Content-Type": "text/html"
			}
		})
	}
}