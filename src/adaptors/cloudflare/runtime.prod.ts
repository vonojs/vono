import { AsyncLocalStorage } from "node:async_hooks";

export default {
	fetch: async (request: Request, env: any) => {
		if (request.method === "GET") {
			const a = await (env.ASSETS as any).fetch(request);
			if (a.ok) return a;
			if (a.status === 304) {
				return new Response(null, {
					status: 304,
					statusText: "Not Modified",
				});
			}
		}

		// @ts-ignore - alias
		const { default: handler } = await import("#vono/entry");
		const requestContext = new AsyncLocalStorage<Request>();
		// @ts-ignore
		globalThis.getRequest_unsafe = () => requestContext.getStore();

		return requestContext.run(request, () => handler(request));
	},
};
