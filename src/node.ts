export interface ClientAddress {
	/**
	 * The IP address of the client that sent the request.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremoteaddress)
	 */
	address: string;
	/**
	 * The family of the client IP address.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremotefamily)
	 */
	family: 'IPv4' | 'IPv6';
	/**
	 * The remote port of the client that sent the request.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremoteport)
	 */
	port: number;
}

/**
 * A function that handles an error that occurred during request handling. May return a response to
 * send to the client, or `undefined` to allow the server to send a default error response.
 *
 * [MDN `Response` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
 */
export interface ErrorHandler {
	(error: unknown): void | Response | Promise<void | Response>;
}

/**
 * A function that handles an incoming request and returns a response.
 *
 * [MDN `Request` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
 *
 * [MDN `Response` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
 */
export interface FetchHandler {
	(request: Request, client: ClientAddress): Response | Promise<Response>;
}

export async function* readStream(stream: ReadableStream<Uint8Array>): AsyncIterable<Uint8Array> {
	let reader = stream.getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		yield value;
	}
}

import type * as http from 'node:http';
import type * as http2 from 'node:http2';

export interface RequestListenerOptions {
	/**
	 * Overrides the host portion of the incoming request URL. By default the request URL host is
	 * derived from the HTTP `Host` header.
	 *
	 * For example, if you have a `$HOST` environment variable that contains the hostname of your
	 * server, you can use it to set the host of all incoming request URLs like so:
	 *
	 * ```ts
	 * createRequestListener(handler, { host: process.env.HOST })
	 * ```
	 */
	host?: string;
	/**
	 * An error handler that determines the response when the request handler throws an error. By
	 * default a 500 Internal Server Error response will be sent.
	 */
	onError?: ErrorHandler;
	/**
	 * Overrides the protocol of the incoming request URL. By default the request URL protocol is
	 * derived from the connection protocol. So e.g. when serving over HTTPS (using
	 * `https.createServer()`), the request URL will begin with `https:`.
	 */
	protocol?: string;
}

export type RequestOptions = Omit<RequestListenerOptions, 'onError'>;

/**
 * Creates a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object from
 *
 * - a [`http.IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage)/[`http.ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) pair
 * - a [`http2.Http2ServerRequest`](https://nodejs.org/api/http2.html#class-http2http2serverrequest)/[`http2.Http2ServerResponse`](https://nodejs.org/api/http2.html#class-http2http2serverresponse) pair
 *
 * @param req The incoming request object.
 * @param res The server response object.
 * @param options
 * @returns A request object.
 */
export function createRequest(
	req: http.IncomingMessage | http2.Http2ServerRequest,
	res: http.ServerResponse | http2.Http2ServerResponse,
	options?: RequestOptions,
): Request {
	let controller = new AbortController();
	res.on('close', () => {
		controller.abort();
	});

	let method = req.method ?? 'GET';
	let headers = createHeaders(req);

	let protocol =
		options?.protocol ?? ('encrypted' in req.socket && req.socket.encrypted ? 'https:' : 'http:');
	let host = options?.host ?? headers.get('Host') ?? 'localhost';
	let url = new URL(req.url!, `${protocol}//${host}`);

	let init: RequestInit = { method, headers, signal: controller.signal };

	if (method !== 'GET' && method !== 'HEAD') {
		init.body = new ReadableStream({
			start(controller) {
				req.on('data', (chunk) => {
					controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
				});
				req.on('end', () => {
					controller.close();
				});
			},
		});

		// init.duplex = 'half' must be set when body is a ReadableStream, and Node follows the spec.
		// However, this property is not defined in the TypeScript types for RequestInit, so we have
		// to cast it here in order to set it without a type error.
		// See https://fetch.spec.whatwg.org/#dom-requestinit-duplex
		(init as { duplex: 'half' }).duplex = 'half';
	}

	return new Request(url, init);
}

/**
 * Creates a [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object from the headers in a Node.js
 * [`http.IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage)/[`http2.Http2ServerRequest`](https://nodejs.org/api/http2.html#class-http2http2serverrequest).
 *
 * @param req The incoming request object.
 * @returns A headers object.
 */
export function createHeaders(req: http.IncomingMessage | http2.Http2ServerRequest): Headers {
	let headers = new Headers();

	let rawHeaders = req.rawHeaders;
	for (let i = 0; i < rawHeaders.length; i += 2) {
		if (rawHeaders[i].startsWith(':')) continue;
		headers.append(rawHeaders[i], rawHeaders[i + 1]);
	}

	return headers;
}

/**
 * Sends a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) to the client using a Node.js
 * [`http.ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse)/[`http2.Http2ServerResponse`](https://nodejs.org/api/http2.html#class-http2http2serverresponse)
 * object.
 *
 * @param res The server response object.
 * @param response The response to send.
 */
export async function sendResponse(
	res: http.ServerResponse | http2.Http2ServerResponse,
	response: Response,
): Promise<void> {
	// Iterate over response.headers so we are sure to send multiple Set-Cookie headers correctly.
	// These would incorrectly be merged into a single header if we tried to use
	// `Object.fromEntries(response.headers.entries())`.
	let headers: Record<string, string | string[]> = {};
	// @ts-ignore
	for (let [key, value] of response.headers) {
		if (key in headers) {
			if (Array.isArray(headers[key])) {
				headers[key].push(value);
			} else {
				headers[key] = [headers[key] as string, value];
			}
		} else {
			headers[key] = value;
		}
	}

	res.writeHead(response.status, headers);

	if (response.body != null && res.req.method !== 'HEAD') {
		for await (let chunk of readStream(response.body)) {
			res.write(chunk);
		}
	}

	res.end();
}