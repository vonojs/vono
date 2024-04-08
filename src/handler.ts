import {RequestContext} from "../vono/ctx.ts";
import shell from "#vono/shell"
import {getModuleManifest} from "../vono/assets.ts";

async function handler(_request: Request) {
	const req = RequestContext.getStore();
	console.log(await getModuleManifest("/src/client.entry.tsx"))
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html"
		},
	})
}

export default handler;