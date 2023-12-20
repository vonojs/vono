/***********************************************************
*
*  This module has been adapted from Remix's Vite plugin.
*  https://remix.run
*
***********************************************************/

import { Hono } from "hono";
import type {
	IncomingHttpHeaders,
	IncomingMessage,
	ServerResponse,
} from "node:http";
import { once } from "node:events";
import { Readable } from "node:stream";
// @ts-expect-error
import { splitCookiesString } from "set-cookie-parser";
import { assert } from "./invariant";
import { createReadableStreamFromReadable } from "./node";
import { log } from "../index";

function createHeaders(requestHeaders: IncomingHttpHeaders) {
	let headers = new Headers();

	for (let [key, values] of Object.entries(requestHeaders)) {
		if (values) {
			if (Array.isArray(values)) {
				for (let value of values) {
					headers.append(key, value);
				}
			} else {
				headers.set(key, values);
			}
		}
	}

	return headers;
}

// Based on `createRemixRequest` in packages/remix-express/server.ts
function createRequest(req: IncomingMessage, res: ServerResponse): Request {
	let origin =
		req.headers.origin && "null" !== req.headers.origin
			? req.headers.origin
			: `http://${req.headers.host}`;
	assert(req.url, 'Expected "req.url" to be defined');
	let url = new URL(req.url, origin);

	let init: RequestInit = {
		method: req.method,
		headers: createHeaders(req.headers),
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		init.body = createReadableStreamFromReadable(req);
		(init as { duplex: "half" }).duplex = "half";
	}

	return new Request(url.href, init);
}

// Adapted from solid-start's `handleNodeResponse`:
// https://github.com/solidjs/solid-start/blob/7398163869b489cce503c167e284891cf51a6613/packages/start/node/fetch.js#L162-L185
async function handleNodeResponse(webRes: Response, res: ServerResponse) {
	res.statusCode = webRes.status;
	res.statusMessage = webRes.statusText;

	let cookiesStrings = [];

	for (let [name, value] of webRes.headers) {
		if (name === "set-cookie") {
			cookiesStrings.push(...splitCookiesString(value));
		} else res.setHeader(name, value);
	}

	if (cookiesStrings.length) {
		res.setHeader("set-cookie", cookiesStrings);
	}

	if (webRes.body) {
		// https://github.com/microsoft/TypeScript/issues/29867
		let responseBody = webRes.body as unknown as AsyncIterable<Uint8Array>;
		let readable = Readable.from(responseBody);
		readable.pipe(res);
		await once(readable, "end");
	} else {
		res.end();
	}
}

export const handleNodeRequest = async (
	app: Hono,
	req: any,
	res: any,
	next: any
) => {
  const request = createRequest(req, res);
  handleNodeResponse(await app.fetch(request), res);
} 
