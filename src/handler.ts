import {RequestContext} from "../vono/ctx.ts";

async function handler(_request: Request) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const req = RequestContext.getStore();
	return new Response(`Sup, ${req!.url}`)
}

export default handler;