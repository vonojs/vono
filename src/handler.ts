import {RequestContext} from "../vono/ctx.ts";
import shell from "#vono/shell"

async function handler(_request: Request) {
	const req = RequestContext.getStore();
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html"
		},
	})
}

export default handler;