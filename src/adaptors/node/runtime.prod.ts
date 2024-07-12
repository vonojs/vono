import { createServer, IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";
import { AsyncLocalStorage } from "node:async_hooks";

// @ts-ignore - alias
import handler from "#vono/entry";

const requestContext = new AsyncLocalStorage<Request>();
// @ts-ignore - undeclared global
globalThis.getRequest_unsafe = () => requestContext.getStore();

async function main() {
	// @ts-ignore - no types
	const sirv = (await import("./sirv.dist.js")).default;
	const { createRequest, handleNodeResponse } = await import(
		"../../node-polyfills.js"
	);

	const port =
		process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] ??
		8000;

	const immutablesHandler = sirv("./client", {
		immutable: true,
		maxAge: 31536000,
		dev: false,
	});

	const publicHandler = sirv("./client", {
		maxAge: 0,
		dev: false,
		etag: true,
	});

	const httpServer = createServer((req, res) => {
		if (req.url?.startsWith("/__immutables/")) {
			immutablesHandler(req, res, () => {
				const webRequest = createRequest(req);
				requestContext.run(webRequest, () =>
					handler(webRequest).then((response: Response) =>
						handleNodeResponse(response, res),
					),
				);
			});
		} else {
			publicHandler(req, res, () => {
				const webRequest = createRequest(req);
				requestContext.run(webRequest, () =>
					handler(webRequest).then((response: Response) =>
						handleNodeResponse(response, res),
					),
				);
			});
		}
	});

	httpServer.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

if (
	[process.argv[1], process.argv[1] + ".js"].some(
		(s) => s === fileURLToPath(import.meta.url),
	)
) {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}

export const createMiddleware = async () => {
	const { createRequest, handleNodeResponse } = await import(
		"../../node-polyfills.js"
	);
	return (req: IncomingMessage) => {
		const webRequest = createRequest(req);
		return requestContext.run(webRequest, () => handler(webRequest));
	};
};

export const createWebMiddleware = async () => {
	const { createRequest, handleNodeResponse } = await import(
		"../../node-polyfills.js"
	);
	return (request: Request) =>
		requestContext.run(request, () => handler(request));
};
