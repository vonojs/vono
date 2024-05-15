/***********************************************************
 *
 *  This module has been adapted from Remix's Vite plugin. https://remix.run
 *	Big thanks to them!
 *  Although I did have to convert a bunch of lets to consts o_o
 *
 ***********************************************************/

import { Readable, Stream } from "node:stream";
import type { IncomingHttpHeaders, IncomingMessage, ServerResponse, } from "node:http";
import { once } from "node:events";
// @ts-expect-error
import { splitCookiesString } from "set-cookie-parser";

class StreamPump {
	public highWaterMark: number;
	public accumalatedSize: number;
	private stream: Stream & {
		readableHighWaterMark?: number;
		readable?: boolean;
		resume?: () => void;
		pause?: () => void;
		destroy?: (error?: Error) => void;
	};
	private controller?: ReadableStreamController<Uint8Array>;

	constructor(
		stream: Stream & {
			readableHighWaterMark?: number;
			readable?: boolean;
			resume?: () => void;
			pause?: () => void;
			destroy?: (error?: Error) => void;
		},
	) {
		this.highWaterMark =
			stream.readableHighWaterMark ||
			new Stream.Readable().readableHighWaterMark;
		this.accumalatedSize = 0;
		this.stream = stream;
		this.enqueue = this.enqueue.bind(this);
		this.error = this.error.bind(this);
		this.close = this.close.bind(this);
	}

	size(chunk: Uint8Array) {
		return chunk?.byteLength || 0;
	}

	start(controller: ReadableStreamController<Uint8Array>) {
		this.controller = controller;
		this.stream.on("data", this.enqueue);
		this.stream.once("error", this.error);
		this.stream.once("end", this.close);
		this.stream.once("close", this.close);
	}

	pull() {
		this.resume();
	}

	cancel(reason?: Error) {
		if (this.stream.destroy) {
			this.stream.destroy(reason);
		}

		this.stream.off("data", this.enqueue);
		this.stream.off("error", this.error);
		this.stream.off("end", this.close);
		this.stream.off("close", this.close);
	}

	enqueue(chunk: Uint8Array | string) {
		if (this.controller) {
			try {
				let bytes = chunk instanceof Uint8Array ? chunk : Buffer.from(chunk);

				let available = (this.controller.desiredSize || 0) - bytes.byteLength;
				this.controller.enqueue(bytes);
				if (available <= 0) {
					this.pause();
				}
			} catch (error: any) {
				this.controller.error(
					new Error(
						"Could not create Buffer, chunk must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object",
					),
				);
				this.cancel();
			}
		}
	}

	pause() {
		if (this.stream.pause) {
			this.stream.pause();
		}
	}

	resume() {
		if (this.stream.readable && this.stream.resume) {
			this.stream.resume();
		}
	}

	close() {
		if (this.controller) {
			this.controller.close();
			delete this.controller;
		}
	}

	error(error: Error) {
		if (this.controller) {
			this.controller.error(error);
			delete this.controller;
		}
	}
}

const createReadableStreamFromReadable = (
	source: Readable & { readableHighWaterMark?: number },
) => {
	const pump = new StreamPump(source);
	const stream = new ReadableStream(pump, pump);
	return stream;
};

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

export function createRequest(
	req: IncomingMessage,
): Request {
	const origin =
		req.headers.origin && "null" !== req.headers.origin
			? req.headers.origin
			: `http://${req.headers.host}`;
	const url = new URL(req.url!, origin);

	const init: RequestInit = {
		method: req.method,
		headers: createHeaders(req.headers),
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		init.body = createReadableStreamFromReadable(req);
		(init as { duplex: "half" }).duplex = "half";
	}

	return new Request(url.href, init);
}

export async function handleNodeResponse(
	webRes: Response,
	res: ServerResponse,
) {
	res.statusCode = webRes.status;
	res.statusMessage = webRes.statusText;

	const cookiesStrings = [];

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
		const responseBody = webRes.body as unknown as AsyncIterable<Uint8Array>;
		const readable = Readable.from(responseBody);
		readable.pipe(res);
		await once(readable, "end");
	} else {
		res.end();
	}
}