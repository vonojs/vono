import shell from "#vono/shell";
import {getRequest} from "#vono/request"
// import { getEntry } from "../../src/runtime/lol.server.ts";

export default async function handler(_request: Request) {
	const req = getRequest();
	// console.log(await getEntry())
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
