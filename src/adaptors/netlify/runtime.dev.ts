// @ts-ignore - alias
import handler from "#vono/entry";
import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage<Request>();
// @ts-ignore
globalThis.getRequest_unsafe = () => requestContext.getStore();

export default (req: Request) => {
	return requestContext.run(req, () => handler(req));
};
