import { AsyncLocalStorage } from "node:async_hooks";
// @ts-ignore - alias
const { default: handler } = await import("#vono/entry");

const requestContext = new AsyncLocalStorage<Request>();
// @ts-ignore - alias
globalThis.getRequest_unsafe = () => requestContext.getStore();

export default (req: Request) => {
	return requestContext.run(req, () => handler(req));
};
