import { once } from "node:events";
import { Readable } from "node:stream";
import { splitCookiesString } from "set-cookie-parser";
import { createReadableStreamFromReadable } from "./node.js";
function createHeaders(requestHeaders) {
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
export function createRequest(req, res) {
  let origin = req.headers.origin && "null" !== req.headers.origin ? req.headers.origin : `http://${req.headers.host}`;
  let url = new URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createHeaders(req.headers)
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = createReadableStreamFromReadable(req);
    init.duplex = "half";
  }
  return new Request(url.href, init);
}
export async function handleNodeResponse(webRes, res) {
  res.statusCode = webRes.status;
  res.statusMessage = webRes.statusText;
  let cookiesStrings = [];
  for (let [name, value] of webRes.headers) {
    if (name === "set-cookie") {
      cookiesStrings.push(...splitCookiesString(value));
    } else
      res.setHeader(name, value);
  }
  if (cookiesStrings.length) {
    res.setHeader("set-cookie", cookiesStrings);
  }
  if (webRes.body) {
    let responseBody = webRes.body;
    let readable = Readable.from(responseBody);
    readable.pipe(res);
    await once(readable, "end");
  } else {
    res.end();
  }
}
