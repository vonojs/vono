import { createServer } from "node:http";
import type http from "node:http";
import http2 from "node:http2";
import { createRequest, sendResponse } from "../../../node.ts";
// @ts-ignore - virtual
import serverEntry from "#vono/server";
import { fileURLToPath } from "node:url";
import sirv from "sirv"

export let webHandler = async (request: Request, context: any) => {
	let handler = typeof serverEntry === "function"
		? serverEntry : serverEntry.fetch;
	let response = await handler(request, context);
	if(response instanceof Response) {
		return response;
	}
	return new Response("Internal Server Error", {
		status: 500,
		headers: {
			"Content-Type": "text/plain",
		}
	})
}

export let nodeHandler = (
	req: http.IncomingMessage | http2.Http2ServerRequest,
	res: http.ServerResponse | http2.Http2ServerResponse,
	context: any,
) => {
	let webRequest = createRequest(req, res);
	webHandler(webRequest, context).then(
		(response: Response) => sendResponse(res, response)
	)
}

async function main() {
	const immutablesHandler = sirv("./dist", {
		immutable: true,
		maxAge: 31536000,
		dev: false,
	});

	const publicHandler = sirv("./dist", {
		maxAge: 0,
		dev: false,
		etag: true,
	});

	const httpServer = createServer((req, res) => {
		if(req.url?.startsWith("/assets/")){
			console.log(`Serving static asset: ${req.url}`);
			immutablesHandler(req, res, () => {
				nodeHandler(req, res, {});
			});
		} else {
			publicHandler(req, res, () => {
				nodeHandler(req, res, {});
			});
		}
	});

	const port = process.argv[2] ?? 8000;

	httpServer.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

let isEntry = [process.argv[1], process.argv[1] + ".js"].some(
	(s) => s === fileURLToPath(import.meta.url)
)

if (isEntry) {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}