// @ts-ignore - alias
import handler from "#vono/entry";

export default async (req: Request) => {
	const { AsyncLocalStorage } = await import("node:async_hooks");
	const requestContext = new AsyncLocalStorage<Request>();
	globalThis.getRequest_unsafe = () => requestContext.getStore();
	return requestContext.run(req, () => handler(req));
};

export const config = {
	path: "/*",
	preferStatic: true,
};
