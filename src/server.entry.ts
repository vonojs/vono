import { AsyncLocalStorage } from 'node:async_hooks';
import {getRequest, REQUEST_CONTEXT} from "../vono/context.ts";
import {RequestContext} from "../vono/ctx.ts";

globalThis[REQUEST_CONTEXT] = new AsyncLocalStorage()

export default (request: Request) => {
	return globalThis[REQUEST_CONTEXT]!.run(request, () => handler(request))
}

async function handler(_request: Request) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const req = getRequest();
	console.log("SHARED", RequestContext.getStore())
	return new Response(`Hello, ${req!.url}`)
}