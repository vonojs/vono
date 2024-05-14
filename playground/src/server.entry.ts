import shell from "#vono/shell";
import {getRequest} from "#vono/request"
import {middleware} from "#vono/endpoints"
import manifest from "#vono/endpoints/manifest"

export default async function handler(_request: Request) {
	console.log(manifest)
	const req = getRequest();
	if(new URL(req!.url).pathname.startsWith("/__endpoints")){
		return middleware(req!);
	}
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
