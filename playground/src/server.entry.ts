import { EnvironmentContext, RequestContext } from "../../src/ctx";
import manifest from "#vono/manifest";
import shell from "#vono/shell";

export const $startup = async () => {
	console.log("Manifest:", manifest);
	console.log("Environment Context:", EnvironmentContext.getStore());
}

export default async function handler(_request: Request) {
	const req = RequestContext.getStore();
	const env = EnvironmentContext.getStore();
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
