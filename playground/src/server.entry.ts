import shell from "#vono/shell";
import {getRequest} from "#vono/request"

export default async function handler(_request: Request) {
	const req = getRequest();
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
