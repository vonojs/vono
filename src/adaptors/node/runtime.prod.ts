import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { createRequest, handleNodeResponse } from "../../node-polyfills";
// @ts-ignore - alias
import buildctx from "#vono/buildctx";
// @ts-ignore - alias
import handler from "#vono/entry";
import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage<Request>();
// @ts-ignore - alias
globalThis.getRequest_unsafe = () => requestContext.getStore();

async function main() {
	const sirv = (await import("sirv")).default;

	const immutablesHandler = sirv(buildctx.clientOutputDirectory, {
		immutable: true,
		maxAge: 31536000,
		dev: false,
	});

	const publicHandler = sirv(buildctx.clientOutputDirectory, {
		maxAge: 0,
		dev: false,
		etag: true,
	});

	const httpServer = createServer((req, res) => {
		if(req.url?.startsWith("/__immutables/")){
			immutablesHandler(req, res, () => {
				const webRequest = createRequest(req);
				requestContext.run(webRequest, () =>
					handler(webRequest).then((response: Response) =>
						handleNodeResponse(response, res)
					)
				);
			});
		} else {
			publicHandler(req, res, () => {
				const webRequest = createRequest(req);
				requestContext.run(webRequest, () =>
					handler(webRequest).then((response: Response) =>
						handleNodeResponse(response, res)
					),
				);
			});
		}
	});

	const port = process.argv[2] ?? 8000;
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
	return (req: IncomingMessage, res: ServerResponse) => {
		const webRequest = createRequest(req, res);
		return requestContext.run(webRequest, () => handler(webRequest));
	};
};

export const createWebMiddleware = async () => {
	return (request: Request) =>
		requestContext.run(request, () => handler(request));
};
