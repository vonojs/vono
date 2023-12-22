var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _status2, _executionCtx2, _headers2, _preparedHeaders2, _res2, _isFresh2, _a, _validatedData2, _matchResult2, _b, _path2, _c;
const splitPath$1 = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
const splitRoutingPath$1 = (path) => {
  const groups = [];
  for (let i = 0; ; ) {
    let replaced = false;
    path = path.replace(/\{[^}]+\}/g, (m2) => {
      const mark = `@\\${i}`;
      groups[i] = [mark, m2];
      i++;
      replaced = true;
      return mark;
    });
    if (!replaced) {
      break;
    }
  }
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j2 = paths.length - 1; j2 >= 0; j2--) {
      if (paths[j2].indexOf(mark) !== -1) {
        paths[j2] = paths[j2].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
const patternCache$1 = {};
const getPattern$1 = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache$1[label]) {
      if (match[2]) {
        patternCache$1[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache$1[label] = [label, match[1], true];
      }
    }
    return patternCache$1[label];
  }
  return null;
};
const getPath$1 = (request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
};
const getQueryStrings$1 = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
const getPathNoStrict$1 = (request) => {
  const result = getPath$1(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
const mergePath$1 = (...paths) => {
  let p2 = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p2[p2.length - 1] === "/") {
      p2 = p2.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p2 = `${p2}/`;
    } else if (path !== "/") {
      p2 = `${p2}${path}`;
    }
    if (path === "/" && p2 === "") {
      p2 = "/";
    }
  }
  return p2;
};
const checkOptionalParameter$1 = (path) => {
  const match = path.match(/^(.+|)(\/\:[^\/]+)\?$/);
  if (!match)
    return null;
  const base = match[1];
  const optional = base + match[2];
  return [base === "" ? "/" : base.replace(/\/$/, ""), optional];
};
const _decodeURI$1 = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_$1(value) : value;
};
const _getQueryParam$1 = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI$1(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI$1(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI$1(value);
      }
    }
    if (multiple) {
      (results[name] ?? (results[name] = [])).push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
const getQueryParam$1 = _getQueryParam$1;
const getQueryParams$1 = (url, key) => {
  return _getQueryParam$1(url, key, true);
};
const decodeURIComponent_$1 = decodeURIComponent;
const validCookieNameRegEx$1 = /^[\w!#$%&'*.^`|~+-]+$/;
const validCookieValueRegEx$1 = /^[ !#-:<-[\]-~]*$/;
const parse$1 = (cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1)
      return parsedCookie;
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx$1.test(cookieName))
      return parsedCookie;
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"'))
      cookieValue = cookieValue.slice(1, -1);
    if (validCookieValueRegEx$1.test(cookieValue))
      parsedCookie[cookieName] = decodeURIComponent_$1(cookieValue);
    return parsedCookie;
  }, {});
};
const _serialize$1 = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  if (opt.partitioned) {
    cookie += "; Partitioned";
  }
  return cookie;
};
const serialize$1 = (name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize$1(name, value, opt);
};
const resolveStream$1 = (str, buffer) => {
  var _a2;
  if (!((_a2 = str.callbacks) == null ? void 0 : _a2.length)) {
    return Promise.resolve(str);
  }
  const callbacks = str.callbacks;
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  return Promise.all(callbacks.map((c2) => c2({ buffer }))).then(
    (res) => Promise.all(res.map((str2) => resolveStream$1(str2, buffer))).then(() => buffer[0])
  );
};
let StreamingApi$1 = class StreamingApi {
  constructor(writable) {
    __publicField(this, "writer");
    __publicField(this, "encoder");
    __publicField(this, "writable");
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder();
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch (e) {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch (e) {
    }
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
};
const TEXT_PLAIN$1 = "text/plain; charset=UTF-8";
let Context$1 = (_a = class {
  constructor(req, options) {
    __publicField(this, "req");
    __publicField(this, "env", {});
    __publicField(this, "_var", {});
    __publicField(this, "finalized", false);
    __publicField(this, "error");
    __privateAdd(this, _status2, 200);
    __privateAdd(this, _executionCtx2, void 0);
    __privateAdd(this, _headers2, void 0);
    __privateAdd(this, _preparedHeaders2, void 0);
    __privateAdd(this, _res2, void 0);
    __privateAdd(this, _isFresh2, true);
    __publicField(this, "renderer", (content) => this.html(content));
    __publicField(this, "notFoundHandler", () => new Response());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __publicField(this, "render", (...args) => this.renderer(...args));
    __publicField(this, "setRenderer", (renderer) => {
      this.renderer = renderer;
    });
    __publicField(this, "header", (name, value, options) => {
      if (value === void 0) {
        if (__privateGet(this, _headers2)) {
          __privateGet(this, _headers2).delete(name);
        } else if (__privateGet(this, _preparedHeaders2)) {
          delete __privateGet(this, _preparedHeaders2)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options == null ? void 0 : options.append) {
        if (!__privateGet(this, _headers2)) {
          __privateSet(this, _isFresh2, false);
          __privateSet(this, _headers2, new Headers(__privateGet(this, _preparedHeaders2)));
          __privateSet(this, _preparedHeaders2, {});
        }
        __privateGet(this, _headers2).append(name, value);
      } else {
        if (__privateGet(this, _headers2)) {
          __privateGet(this, _headers2).set(name, value);
        } else {
          __privateGet(this, _preparedHeaders2) ?? __privateSet(this, _preparedHeaders2, {});
          __privateGet(this, _preparedHeaders2)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options == null ? void 0 : options.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    });
    __publicField(this, "status", (status) => {
      __privateSet(this, _isFresh2, false);
      __privateSet(this, _status2, status);
    });
    __publicField(this, "set", (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    });
    __publicField(this, "get", (key) => {
      return this._var ? this._var[key] : void 0;
    });
    __publicField(this, "newResponse", (data, arg, headers) => {
      if (__privateGet(this, _isFresh2) && !headers && !arg && __privateGet(this, _status2) === 200) {
        return new Response(data, {
          headers: __privateGet(this, _preparedHeaders2)
        });
      }
      if (arg && typeof arg !== "number") {
        this.res = new Response(data, arg);
      }
      const status = typeof arg === "number" ? arg : arg ? arg.status : __privateGet(this, _status2);
      __privateGet(this, _preparedHeaders2) ?? __privateSet(this, _preparedHeaders2, {});
      __privateGet(this, _headers2) ?? __privateSet(this, _headers2, new Headers());
      for (const [k2, v2] of Object.entries(__privateGet(this, _preparedHeaders2))) {
        __privateGet(this, _headers2).set(k2, v2);
      }
      if (__privateGet(this, _res2)) {
        __privateGet(this, _res2).headers.forEach((v2, k2) => {
          var _a2;
          (_a2 = __privateGet(this, _headers2)) == null ? void 0 : _a2.set(k2, v2);
        });
        for (const [k2, v2] of Object.entries(__privateGet(this, _preparedHeaders2))) {
          __privateGet(this, _headers2).set(k2, v2);
        }
      }
      headers ?? (headers = {});
      for (const [k2, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          __privateGet(this, _headers2).set(k2, v2);
        } else {
          __privateGet(this, _headers2).delete(k2);
          for (const v22 of v2) {
            __privateGet(this, _headers2).append(k2, v22);
          }
        }
      }
      return new Response(data, {
        status,
        headers: __privateGet(this, _headers2)
      });
    });
    __publicField(this, "body", (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    });
    __publicField(this, "text", (text, arg, headers) => {
      if (!__privateGet(this, _preparedHeaders2)) {
        if (__privateGet(this, _isFresh2) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet(this, _preparedHeaders2, {});
      }
      __privateGet(this, _preparedHeaders2)["content-type"] = TEXT_PLAIN$1;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    });
    __publicField(this, "json", (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet(this, _preparedHeaders2) ?? __privateSet(this, _preparedHeaders2, {});
      __privateGet(this, _preparedHeaders2)["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    });
    /**
     * @deprecated
     * `c.jsonT()` will be removed in v4.
     * Use `c.json()` instead of `c.jsonT()`.
     * `c.json()` now returns data type, so you can just replace `c.jsonT()` to `c.json()`.
     */
    __publicField(this, "jsonT", (object, arg, headers) => {
      return this.json(object, arg, headers);
    });
    __publicField(this, "html", (html, arg, headers) => {
      __privateGet(this, _preparedHeaders2) ?? __privateSet(this, _preparedHeaders2, {});
      __privateGet(this, _preparedHeaders2)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveStream$1(html2)).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    });
    __publicField(this, "redirect", (location, status = 302) => {
      __privateGet(this, _headers2) ?? __privateSet(this, _headers2, new Headers());
      __privateGet(this, _headers2).set("Location", location);
      return this.newResponse(null, status);
    });
    __publicField(this, "streamText", (cb, arg, headers) => {
      headers ?? (headers = {});
      this.header("content-type", TEXT_PLAIN$1);
      this.header("x-content-type-options", "nosniff");
      this.header("transfer-encoding", "chunked");
      return this.stream(cb, arg, headers);
    });
    __publicField(this, "stream", (cb, arg, headers) => {
      const { readable, writable } = new TransformStream();
      const stream = new StreamingApi$1(writable);
      cb(stream).finally(() => stream.close());
      return typeof arg === "number" ? this.newResponse(readable, arg, headers) : this.newResponse(readable, arg);
    });
    /** @deprecated
     * Use Cookie Middleware instead of `c.cookie()`. The `c.cookie()` will be removed in v4.
     *
     * @example
     *
     * import { setCookie } from 'hono/cookie'
     * // ...
     * app.get('/', (c) => {
     *   setCookie(c, 'key', 'value')
     *   //...
     * })
     */
    __publicField(this, "cookie", (name, value, opt) => {
      const cookie = serialize$1(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    });
    __publicField(this, "notFound", () => {
      return this.notFoundHandler(this);
    });
    this.req = req;
    if (options) {
      __privateSet(this, _executionCtx2, options.executionCtx);
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (__privateGet(this, _executionCtx2) && "respondWith" in __privateGet(this, _executionCtx2)) {
      return __privateGet(this, _executionCtx2);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet(this, _executionCtx2)) {
      return __privateGet(this, _executionCtx2);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet(this, _isFresh2, false);
    return __privateGet(this, _res2) || __privateSet(this, _res2, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res3) {
    __privateSet(this, _isFresh2, false);
    if (__privateGet(this, _res2) && _res3) {
      __privateGet(this, _res2).headers.delete("content-type");
      __privateGet(this, _res2).headers.forEach((v2, k2) => {
        _res3.headers.set(k2, v2);
      });
    }
    __privateSet(this, _res2, _res3);
    this.finalized = true;
  }
  // c.var.propName is a read-only
  get var() {
    return { ...this._var };
  }
  /** @deprecated
   * Use `getRuntimeKey()` exported from `hono/adapter` instead of `c.runtime()`. The `c.runtime()` will be removed in v4.
   *
   * @example
   *
   * import { getRuntimeKey } from 'hono/adapter'
   * // ...
   * app.get('/', (c) => {
   *   const key = getRuntimeKey()
   *   //...
   * })
   */
  get runtime() {
    var _a2, _b2;
    const global = globalThis;
    if ((global == null ? void 0 : global.Deno) !== void 0) {
      return "deno";
    }
    if ((global == null ? void 0 : global.Bun) !== void 0) {
      return "bun";
    }
    if (typeof (global == null ? void 0 : global.WebSocketPair) === "function") {
      return "workerd";
    }
    if (typeof (global == null ? void 0 : global.EdgeRuntime) === "string") {
      return "edge-light";
    }
    if ((global == null ? void 0 : global.fastly) !== void 0) {
      return "fastly";
    }
    if ((global == null ? void 0 : global.__lagon__) !== void 0) {
      return "lagon";
    }
    if (((_b2 = (_a2 = global == null ? void 0 : global.process) == null ? void 0 : _a2.release) == null ? void 0 : _b2.name) === "node") {
      return "node";
    }
    return "other";
  }
}, _status2 = new WeakMap(), _executionCtx2 = new WeakMap(), _headers2 = new WeakMap(), _preparedHeaders2 = new WeakMap(), _res2 = new WeakMap(), _isFresh2 = new WeakMap(), _a);
const compose$1 = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (context instanceof Context$1) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (!handler) {
        if (context instanceof Context$1 && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context$1 && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
let HTTPException$1 = class HTTPException extends Error {
  constructor(status = 500, options) {
    super(options == null ? void 0 : options.message);
    __publicField(this, "res");
    __publicField(this, "status");
    this.res = options == null ? void 0 : options.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};
const isArrayField$1 = (value) => {
  return Array.isArray(value);
};
const parseBody$1 = async (request, options = {
  all: false
}) => {
  let body = {};
  const contentType = request.headers.get("Content-Type");
  if (contentType && (contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded"))) {
    const formData = await request.formData();
    if (formData) {
      const form = {};
      formData.forEach((value, key) => {
        const shouldParseAllValues = options.all || key.slice(-2) === "[]";
        if (!shouldParseAllValues) {
          form[key] = value;
          return;
        }
        if (form[key] && isArrayField$1(form[key])) {
          form[key].push(value);
          return;
        }
        if (form[key]) {
          form[key] = [form[key], value];
          return;
        }
        form[key] = value;
      });
      body = form;
    }
  }
  return body;
};
let HonoRequest$1 = (_b = class {
  constructor(request, path = "/", matchResult = [[]]) {
    __publicField(this, "raw");
    __privateAdd(this, _validatedData2, void 0);
    // Short name of validatedData
    __privateAdd(this, _matchResult2, void 0);
    __publicField(this, "routeIndex", 0);
    __publicField(this, "path");
    __publicField(this, "bodyCache", {});
    __publicField(this, "cachedBody", (key) => {
      const { bodyCache, raw } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody)
        return cachedBody;
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw[key]();
    });
    this.raw = request;
    this.path = path;
    __privateSet(this, _matchResult2, matchResult);
    __privateSet(this, _validatedData2, {});
  }
  param(key) {
    if (key) {
      const param = __privateGet(this, _matchResult2)[1] ? __privateGet(this, _matchResult2)[1][__privateGet(this, _matchResult2)[0][this.routeIndex][1][key]] : __privateGet(this, _matchResult2)[0][this.routeIndex][1][key];
      return param ? /\%/.test(param) ? decodeURIComponent_$1(param) : param : void 0;
    } else {
      const decoded = {};
      const keys = Object.keys(__privateGet(this, _matchResult2)[0][this.routeIndex][1]);
      for (let i = 0, len = keys.length; i < len; i++) {
        const key2 = keys[i];
        const value = __privateGet(this, _matchResult2)[1] ? __privateGet(this, _matchResult2)[1][__privateGet(this, _matchResult2)[0][this.routeIndex][1][key2]] : __privateGet(this, _matchResult2)[0][this.routeIndex][1][key2];
        if (value && typeof value === "string") {
          decoded[key2] = /\%/.test(value) ? decodeURIComponent_$1(value) : value;
        }
      }
      return decoded;
    }
  }
  query(key) {
    return getQueryParam$1(this.url, key);
  }
  queries(key) {
    return getQueryParams$1(this.url, key);
  }
  header(name) {
    if (name)
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie)
      return;
    const obj = parse$1(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody)
      return this.bodyCache.parsedBody;
    const parsedBody = await parseBody$1(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    __privateGet(this, _validatedData2)[target] = data;
  }
  valid(target) {
    return __privateGet(this, _validatedData2)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet(this, _matchResult2)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet(this, _matchResult2)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
  /** @deprecated
   * Use `c.req.raw.headers` instead of `c.req.headers`. The `c.req.headers` will be removed in v4.
   * Or you can get the header values with using `c.req.header`.
   * @example
   *
   * app.get('/', (c) => {
   *   const userAgent = c.req.header('User-Agent')
   *   //...
   * })
   */
  get headers() {
    return this.raw.headers;
  }
  /** @deprecated
   * Use `c.req.raw.body` instead of `c.req.body`. The `c.req.body` will be removed in v4.
   */
  get body() {
    return this.raw.body;
  }
  /** @deprecated
   * Use `c.req.raw.bodyUsed` instead of `c.req.bodyUsed`. The `c.req.bodyUsed` will be removed in v4.
   */
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  /** @deprecated
   * Use `c.req.raw.integrity` instead of `c.req.integrity`. The `c.req.integrity` will be removed in v4.
   */
  get integrity() {
    return this.raw.integrity;
  }
  /** @deprecated
   * Use `c.req.raw.keepalive` instead of `c.req.keepalive`. The `c.req.keepalive` will be removed in v4.
   */
  get keepalive() {
    return this.raw.keepalive;
  }
  /** @deprecated
   * Use `c.req.raw.referrer` instead of `c.req.referrer`. The `c.req.referrer` will be removed in v4.
   */
  get referrer() {
    return this.raw.referrer;
  }
  /** @deprecated
   * Use `c.req.raw.signal` instead of `c.req.signal`. The `c.req.signal` will be removed in v4.
   */
  get signal() {
    return this.raw.signal;
  }
}, _validatedData2 = new WeakMap(), _matchResult2 = new WeakMap(), _b);
const METHOD_NAME_ALL$1 = "ALL";
const METHOD_NAME_ALL_LOWERCASE$1 = "all";
const METHODS$1 = ["get", "post", "put", "delete", "options", "patch"];
const MESSAGE_MATCHER_IS_ALREADY_BUILT$1 = "Can not add a route since the matcher is already built.";
let UnsupportedPathError$1 = class UnsupportedPathError extends Error {
};
function defineDynamicClass$1() {
  return class {
  };
}
const notFoundHandler$1 = (c2) => {
  return c2.text("404 Not Found", 404);
};
const errorHandler$1 = (err, c2) => {
  if (err instanceof HTTPException$1) {
    return err.getResponse();
  }
  console.error(err);
  const message = "Internal Server Error";
  return c2.text(message, 500);
};
let Hono$3 = (_c = class extends defineDynamicClass$1() {
  constructor(options = {}) {
    super();
    /*
      This class is like an abstract class and does not have a router.
      To use it, inherit the class and implement router in the constructor.
    */
    __publicField(this, "router");
    __publicField(this, "getPath");
    // Cannot use `#` because it requires visibility at JavaScript runtime.
    __publicField(this, "_basePath", "/");
    __privateAdd(this, _path2, "/");
    __publicField(this, "routes", []);
    __publicField(this, "notFoundHandler", notFoundHandler$1);
    __publicField(this, "errorHandler", errorHandler$1);
    __publicField(this, "onError", (handler) => {
      this.errorHandler = handler;
      return this;
    });
    __publicField(this, "notFound", (handler) => {
      this.notFoundHandler = handler;
      return this;
    });
    /**
     * @deprecated
     * `app.head()` is no longer used.
     * `app.get()` implicitly handles the HEAD method.
     */
    __publicField(this, "head", () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    });
    /**
     * @deprecated
     * `app.handleEvent()` will be removed in v4.
     * Use `app.fetch()` instead of `app.handleEvent()`.
     */
    __publicField(this, "handleEvent", (event) => {
      return this.dispatch(event.request, event, void 0, event.request.method);
    });
    __publicField(this, "fetch", (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    });
    __publicField(this, "request", (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath$1("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    });
    __publicField(this, "fire", () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    });
    const allMethods = [...METHODS$1, METHOD_NAME_ALL_LOWERCASE$1];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet(this, _path2, args1);
        } else {
          this.addRoute(method, __privateGet(this, _path2), args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, __privateGet(this, _path2), handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method)
        return this;
      __privateSet(this, _path2, path);
      for (const m2 of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m2.toUpperCase(), __privateGet(this, _path2), handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet(this, _path2, arg1);
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL$1, __privateGet(this, _path2), handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath$1 : getPathNoStrict$1;
  }
  clone() {
    const clone = new _c({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app2) {
    const subApp = this.basePath(path);
    if (!app2) {
      return subApp;
    }
    app2.routes.map((r) => {
      const handler = app2.errorHandler === errorHandler$1 ? r.handler : async (c2, next) => (await compose$1([], app2.errorHandler)(c2, () => r.handler(c2, next))).res;
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath$1(this._basePath, path);
    return subApp;
  }
  /**
   * @deprecated
   * Use `showRoutes()` utility methods provided by 'hono/dev' instead of `app.showRoutes()`.
   * `app.showRoutes()` will be removed in v4.
   * @example
   * You could rewrite `app.showRoutes()` as follows
   * import { showRoutes } from 'hono/dev'
   * showRoutes(app)
   */
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(
        `\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`
      );
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath$1(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c2, next) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c2) : [c2.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings$1(c2.req.url);
      const res = await applicationHandler(
        new Request(
          new URL((c2.req.path.slice(pathPrefixLength) || "/") + queryStrings, c2.req.url),
          c2.req.raw
        ),
        ...optionsArray
      );
      if (res)
        return res;
      await next();
    };
    this.addRoute(METHOD_NAME_ALL$1, mergePath$1(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath$1(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c2 = new Context$1(new HonoRequest$1(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
        });
        if (!res) {
          return this.notFoundHandler(c2);
        }
      } catch (err) {
        return this.handleError(err, c2);
      }
      if (res instanceof Response)
        return res;
      return (async () => {
        let awaited;
        try {
          awaited = await res;
          if (!awaited) {
            return this.notFoundHandler(c2);
          }
        } catch (err) {
          return this.handleError(err, c2);
        }
        return awaited;
      })();
    }
    const composed = compose$1(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c2);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c2);
      }
    })();
  }
}, _path2 = new WeakMap(), _c);
const LABEL_REG_EXP_STR$1 = "[^/]+";
const ONLY_WILDCARD_REG_EXP_STR$1 = ".*";
const TAIL_WILDCARD_REG_EXP_STR$1 = "(?:|/.*)";
const PATH_ERROR$1 = Symbol();
function compareKey$1(a, b2) {
  if (a.length === 1) {
    return b2.length === 1 ? a < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR$1 || a === TAIL_WILDCARD_REG_EXP_STR$1) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR$1 || b2 === TAIL_WILDCARD_REG_EXP_STR$1) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR$1) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR$1) {
    return -1;
  }
  return a.length === b2.length ? a < b2 ? -1 : 1 : b2.length - a.length;
}
let Node$3 = class Node {
  constructor() {
    __publicField(this, "index");
    __publicField(this, "varIndex");
    __publicField(this, "children", {});
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== void 0) {
        throw PATH_ERROR$1;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR$1] : ["", "", LABEL_REG_EXP_STR$1] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR$1] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR$1;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR$1;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some(
          (k2) => k2 !== ONLY_WILDCARD_REG_EXP_STR$1 && k2 !== TAIL_WILDCARD_REG_EXP_STR$1
        )) {
          throw PATH_ERROR$1;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node();
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some(
          (k2) => k2.length > 1 && k2 !== ONLY_WILDCARD_REG_EXP_STR$1 && k2 !== TAIL_WILDCARD_REG_EXP_STR$1
        )) {
          throw PATH_ERROR$1;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey$1);
    const strList = childKeys.map((k2) => {
      const c2 = this.children[k2];
      return (typeof c2.varIndex === "number" ? `(${k2})@${c2.varIndex}` : k2) + c2.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
let Trie$1 = class Trie {
  constructor() {
    __publicField(this, "context", { varIndex: 0 });
    __publicField(this, "root", new Node$3());
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m2];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j2 = tokens.length - 1; j2 >= 0; j2--) {
        if (tokens[j2].indexOf(mark) !== -1) {
          tokens[j2] = tokens[j2].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
const methodNames$1 = [METHOD_NAME_ALL$1, ...METHODS$1].map((method) => method.toUpperCase());
const emptyParam$1 = [];
const nullMatcher$1 = [/^$/, [], {}];
let wildcardRegExpCache$1 = {};
function buildWildcardRegExp$1(path) {
  return wildcardRegExpCache$1[path] ?? (wildcardRegExpCache$1[path] = new RegExp(
    path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}$`
  ));
}
function clearWildcardRegExpCache$1() {
  wildcardRegExpCache$1 = {};
}
function buildMatcherFromPreprocessedRoutes$1(routes) {
  var _a2;
  const trie = new Trie$1();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher$1;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = {};
  for (let i = 0, j2 = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, {}]), emptyParam$1];
    } else {
      j2++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j2, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR$1 ? new UnsupportedPathError$1(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j2] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = {};
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j2 = 0, len2 = handlerData[i].length; j2 < len2; j2++) {
      const map = (_a2 = handlerData[i][j2]) == null ? void 0 : _a2[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k2 = 0, len3 = keys.length; k2 < len3; k2++) {
        map[keys[k2]] = paramReplacementMap[map[keys[k2]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware$1(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k2 of Object.keys(middleware).sort((a, b2) => b2.length - a.length)) {
    if (buildWildcardRegExp$1(k2).test(path)) {
      return [...middleware[k2]];
    }
  }
  return void 0;
}
let RegExpRouter$1 = class RegExpRouter {
  constructor() {
    __publicField(this, "name", "RegExpRouter");
    __publicField(this, "middleware");
    __publicField(this, "routes");
    this.middleware = { [METHOD_NAME_ALL$1]: {} };
    this.routes = { [METHOD_NAME_ALL$1]: {} };
  }
  add(method, path, handler) {
    var _a2;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT$1);
    }
    if (methodNames$1.indexOf(method) === -1)
      methodNames$1.push(method);
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL$1]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL$1][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re2 = buildWildcardRegExp$1(path);
      if (method === METHOD_NAME_ALL$1) {
        Object.keys(middleware).forEach((m2) => {
          var _a3;
          (_a3 = middleware[m2])[path] || (_a3[path] = findMiddleware$1(middleware[m2], path) || findMiddleware$1(middleware[METHOD_NAME_ALL$1], path) || []);
        });
      } else {
        (_a2 = middleware[method])[path] || (_a2[path] = findMiddleware$1(middleware[method], path) || findMiddleware$1(middleware[METHOD_NAME_ALL$1], path) || []);
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL$1 || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re2.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL$1 || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re2.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter$1(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m2) => {
        var _a3;
        if (method === METHOD_NAME_ALL$1 || method === m2) {
          (_a3 = routes[m2])[path2] || (_a3[path2] = [
            ...findMiddleware$1(middleware[m2], path2) || findMiddleware$1(middleware[METHOD_NAME_ALL$1], path2) || []
          ]);
          routes[m2][path2].push([
            handler,
            paths.length === 2 && i === 0 ? paramCount - 1 : paramCount
          ]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache$1();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam$1];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames$1.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL$1];
    });
    this.middleware = this.routes = void 0;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL$1;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL$1) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL$1]).map((path) => [path, r[METHOD_NAME_ALL$1][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes$1(routes);
    }
  }
};
let SmartRouter$1 = class SmartRouter {
  constructor(init) {
    __publicField(this, "name", "SmartRouter");
    __publicField(this, "routers", []);
    __publicField(this, "routes", []);
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT$1);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError$1) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};
let Node$2 = class Node2 {
  constructor(method, handler, children) {
    __publicField(this, "methods");
    __publicField(this, "children");
    __publicField(this, "patterns");
    __publicField(this, "order", 0);
    __publicField(this, "name");
    __publicField(this, "params", {});
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m2 = {};
      m2[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m2];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath$1(path);
    const possibleKeys = [];
    const parentPatterns = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p2 = parts[i];
      if (Object.keys(curNode.children).includes(p2)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p2];
        const pattern2 = getPattern$1(p2);
        if (pattern2)
          possibleKeys.push(pattern2[1]);
        continue;
      }
      curNode.children[p2] = new Node2();
      const pattern = getPattern$1(p2);
      if (pattern) {
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
        possibleKeys.push(pattern[1]);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p2];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m2 = {};
    const handlerSet = {
      handler,
      possibleKeys,
      name: this.name,
      score: this.order
    };
    m2[method] = handlerSet;
    curNode.methods.push(m2);
    return curNode;
  }
  // getHandlerSets
  gHSets(node, method, params) {
    const handlerSets = [];
    for (let i = 0, len = node.methods.length; i < len; i++) {
      const m2 = node.methods[i];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL$1];
      if (handlerSet !== void 0) {
        handlerSet.params = {};
        handlerSet.possibleKeys.map((key) => {
          handlerSet.params[key] = params[key];
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    const params = {};
    this.params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath$1(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j2 = 0, len2 = curNodes.length; j2 < len2; j2++) {
        const node = curNodes[j2];
        const nextNode = node.children[part];
        if (nextNode) {
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, node.params));
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k2 = 0, len3 = node.patterns.length; k2 < len3; k2++) {
          const pattern = node.patterns[k2];
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "")
            continue;
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, { ...params, ...node.params }));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, { ...params, ...node.params }));
                if (child.children["*"]) {
                  handlerSets.push(
                    ...this.gHSets(child.children["*"], method, { ...params, ...node.params })
                  );
                }
              } else {
                child.params = { ...params };
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b2) => {
      return a.score - b2.score;
    });
    return [results.map(({ handler, params: params2 }) => [handler, params2])];
  }
};
let TrieRouter$1 = class TrieRouter {
  constructor() {
    __publicField(this, "name", "TrieRouter");
    __publicField(this, "node");
    this.node = new Node$2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter$1(path);
    if (results) {
      for (const p2 of results) {
        this.node.insert(method, p2, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};
let Hono$2 = class Hono extends Hono$3 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter$1({
      routers: [new RegExpRouter$1(), new TrieRouter$1()]
    });
  }
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (path) => {
  const groups = [];
  for (let i = 0; ; ) {
    let replaced = false;
    path = path.replace(/\{[^}]+\}/g, (m2) => {
      const mark = `@\\${i}`;
      groups[i] = [mark, m2];
      i++;
      replaced = true;
      return mark;
    });
    if (!replaced) {
      break;
    }
  }
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j2 = paths.length - 1; j2 >= 0; j2--) {
      if (paths[j2].indexOf(mark) !== -1) {
        paths[j2] = paths[j2].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var getPath = (request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
};
var getQueryStrings = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p2 = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p2[p2.length - 1] === "/") {
      p2 = p2.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p2 = `${p2}/`;
    } else if (path !== "/") {
      p2 = `${p2}${path}`;
    }
    if (path === "/" && p2 === "") {
      p2 = "/";
    }
  }
  return p2;
};
var checkOptionalParameter = (path) => {
  const match = path.match(/^(.+|)(\/\:[^\/]+)\?$/);
  if (!match)
    return null;
  const base = match[1];
  const optional = base + match[2];
  return [base === "" ? "/" : base.replace(/\/$/, ""), optional];
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      (results[name] ?? (results[name] = [])).push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1)
      return parsedCookie;
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName))
      return parsedCookie;
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"'))
      cookieValue = cookieValue.slice(1, -1);
    if (validCookieValueRegEx.test(cookieValue))
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
    return parsedCookie;
  }, {});
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  if (opt.partitioned) {
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};
var resolveStream = (str, buffer) => {
  var _a2;
  if (!((_a2 = str.callbacks) == null ? void 0 : _a2.length)) {
    return Promise.resolve(str);
  }
  const callbacks = str.callbacks;
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  return Promise.all(callbacks.map((c2) => c2({ buffer }))).then(
    (res) => Promise.all(res.map((str2) => resolveStream(str2, buffer))).then(() => buffer[0])
  );
};
var StreamingApi2 = class {
  constructor(writable) {
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder();
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch (e) {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch (e) {
    }
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
};
var __accessCheck$2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$2 = (obj, member, getter) => {
  __accessCheck$2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$2 = (obj, member, value, setter) => {
  __accessCheck$2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var _status, _executionCtx, _headers, _preparedHeaders, _res, _isFresh;
var Context = class {
  constructor(req, options) {
    this.env = {};
    this._var = {};
    this.finalized = false;
    this.error = void 0;
    __privateAdd$2(this, _status, 200);
    __privateAdd$2(this, _executionCtx, void 0);
    __privateAdd$2(this, _headers, void 0);
    __privateAdd$2(this, _preparedHeaders, void 0);
    __privateAdd$2(this, _res, void 0);
    __privateAdd$2(this, _isFresh, true);
    this.renderer = (content) => this.html(content);
    this.notFoundHandler = () => new Response();
    this.render = (...args) => this.renderer(...args);
    this.setRenderer = (renderer) => {
      this.renderer = renderer;
    };
    this.header = (name, value, options2) => {
      if (value === void 0) {
        if (__privateGet$2(this, _headers)) {
          __privateGet$2(this, _headers).delete(name);
        } else if (__privateGet$2(this, _preparedHeaders)) {
          delete __privateGet$2(this, _preparedHeaders)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options2 == null ? void 0 : options2.append) {
        if (!__privateGet$2(this, _headers)) {
          __privateSet$2(this, _isFresh, false);
          __privateSet$2(this, _headers, new Headers(__privateGet$2(this, _preparedHeaders)));
          __privateSet$2(this, _preparedHeaders, {});
        }
        __privateGet$2(this, _headers).append(name, value);
      } else {
        if (__privateGet$2(this, _headers)) {
          __privateGet$2(this, _headers).set(name, value);
        } else {
          __privateGet$2(this, _preparedHeaders) ?? __privateSet$2(this, _preparedHeaders, {});
          __privateGet$2(this, _preparedHeaders)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options2 == null ? void 0 : options2.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    this.status = (status) => {
      __privateSet$2(this, _isFresh, false);
      __privateSet$2(this, _status, status);
    };
    this.set = (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    };
    this.get = (key) => {
      return this._var ? this._var[key] : void 0;
    };
    this.newResponse = (data, arg, headers) => {
      if (__privateGet$2(this, _isFresh) && !headers && !arg && __privateGet$2(this, _status) === 200) {
        return new Response(data, {
          headers: __privateGet$2(this, _preparedHeaders)
        });
      }
      if (arg && typeof arg !== "number") {
        this.res = new Response(data, arg);
      }
      const status = typeof arg === "number" ? arg : arg ? arg.status : __privateGet$2(this, _status);
      __privateGet$2(this, _preparedHeaders) ?? __privateSet$2(this, _preparedHeaders, {});
      __privateGet$2(this, _headers) ?? __privateSet$2(this, _headers, new Headers());
      for (const [k2, v2] of Object.entries(__privateGet$2(this, _preparedHeaders))) {
        __privateGet$2(this, _headers).set(k2, v2);
      }
      if (__privateGet$2(this, _res)) {
        __privateGet$2(this, _res).headers.forEach((v2, k2) => {
          var _a2;
          (_a2 = __privateGet$2(this, _headers)) == null ? void 0 : _a2.set(k2, v2);
        });
        for (const [k2, v2] of Object.entries(__privateGet$2(this, _preparedHeaders))) {
          __privateGet$2(this, _headers).set(k2, v2);
        }
      }
      headers ?? (headers = {});
      for (const [k2, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          __privateGet$2(this, _headers).set(k2, v2);
        } else {
          __privateGet$2(this, _headers).delete(k2);
          for (const v22 of v2) {
            __privateGet$2(this, _headers).append(k2, v22);
          }
        }
      }
      return new Response(data, {
        status,
        headers: __privateGet$2(this, _headers)
      });
    };
    this.body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    this.text = (text, arg, headers) => {
      if (!__privateGet$2(this, _preparedHeaders)) {
        if (__privateGet$2(this, _isFresh) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet$2(this, _preparedHeaders, {});
      }
      __privateGet$2(this, _preparedHeaders)["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    this.json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet$2(this, _preparedHeaders) ?? __privateSet$2(this, _preparedHeaders, {});
      __privateGet$2(this, _preparedHeaders)["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    this.jsonT = (object, arg, headers) => {
      return this.json(object, arg, headers);
    };
    this.html = (html, arg, headers) => {
      __privateGet$2(this, _preparedHeaders) ?? __privateSet$2(this, _preparedHeaders, {});
      __privateGet$2(this, _preparedHeaders)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveStream(html2)).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    this.redirect = (location, status = 302) => {
      __privateGet$2(this, _headers) ?? __privateSet$2(this, _headers, new Headers());
      __privateGet$2(this, _headers).set("Location", location);
      return this.newResponse(null, status);
    };
    this.streamText = (cb, arg, headers) => {
      headers ?? (headers = {});
      this.header("content-type", TEXT_PLAIN);
      this.header("x-content-type-options", "nosniff");
      this.header("transfer-encoding", "chunked");
      return this.stream(cb, arg, headers);
    };
    this.stream = (cb, arg, headers) => {
      const { readable, writable } = new TransformStream();
      const stream = new StreamingApi2(writable);
      cb(stream).finally(() => stream.close());
      return typeof arg === "number" ? this.newResponse(readable, arg, headers) : this.newResponse(readable, arg);
    };
    this.cookie = (name, value, opt) => {
      const cookie = serialize(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    };
    this.notFound = () => {
      return this.notFoundHandler(this);
    };
    this.req = req;
    if (options) {
      __privateSet$2(this, _executionCtx, options.executionCtx);
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (__privateGet$2(this, _executionCtx) && "respondWith" in __privateGet$2(this, _executionCtx)) {
      return __privateGet$2(this, _executionCtx);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet$2(this, _executionCtx)) {
      return __privateGet$2(this, _executionCtx);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet$2(this, _isFresh, false);
    return __privateGet$2(this, _res) || __privateSet$2(this, _res, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res22) {
    __privateSet$2(this, _isFresh, false);
    if (__privateGet$2(this, _res) && _res22) {
      __privateGet$2(this, _res).headers.delete("content-type");
      __privateGet$2(this, _res).headers.forEach((v2, k2) => {
        _res22.headers.set(k2, v2);
      });
    }
    __privateSet$2(this, _res, _res22);
    this.finalized = true;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    var _a2, _b2;
    const global = globalThis;
    if ((global == null ? void 0 : global.Deno) !== void 0) {
      return "deno";
    }
    if ((global == null ? void 0 : global.Bun) !== void 0) {
      return "bun";
    }
    if (typeof (global == null ? void 0 : global.WebSocketPair) === "function") {
      return "workerd";
    }
    if (typeof (global == null ? void 0 : global.EdgeRuntime) === "string") {
      return "edge-light";
    }
    if ((global == null ? void 0 : global.fastly) !== void 0) {
      return "fastly";
    }
    if ((global == null ? void 0 : global.__lagon__) !== void 0) {
      return "lagon";
    }
    if (((_b2 = (_a2 = global == null ? void 0 : global.process) == null ? void 0 : _a2.release) == null ? void 0 : _b2.name) === "node") {
      return "node";
    }
    return "other";
  }
};
_status = /* @__PURE__ */ new WeakMap();
_executionCtx = /* @__PURE__ */ new WeakMap();
_headers = /* @__PURE__ */ new WeakMap();
_preparedHeaders = /* @__PURE__ */ new WeakMap();
_res = /* @__PURE__ */ new WeakMap();
_isFresh = /* @__PURE__ */ new WeakMap();
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (context instanceof Context) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var HTTPException2 = class extends Error {
  constructor(status = 500, options) {
    super(options == null ? void 0 : options.message);
    this.res = options == null ? void 0 : options.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};
var isArrayField = (value) => {
  return Array.isArray(value);
};
var parseBody = async (request, options = {
  all: false
}) => {
  let body = {};
  const contentType = request.headers.get("Content-Type");
  if (contentType && (contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded"))) {
    const formData = await request.formData();
    if (formData) {
      const form = {};
      formData.forEach((value, key) => {
        const shouldParseAllValues = options.all || key.slice(-2) === "[]";
        if (!shouldParseAllValues) {
          form[key] = value;
          return;
        }
        if (form[key] && isArrayField(form[key])) {
          form[key].push(value);
          return;
        }
        if (form[key]) {
          form[key] = [form[key], value];
          return;
        }
        form[key] = value;
      });
      body = form;
    }
  }
  return body;
};
var __accessCheck$1 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$1 = (obj, member, getter) => {
  __accessCheck$1(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$1 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$1 = (obj, member, value, setter) => {
  __accessCheck$1(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _validatedData, _matchResult;
var HonoRequest = class {
  constructor(request, path = "/", matchResult = [[]]) {
    __privateAdd$1(this, _validatedData, void 0);
    __privateAdd$1(this, _matchResult, void 0);
    this.routeIndex = 0;
    this.bodyCache = {};
    this.cachedBody = (key) => {
      const { bodyCache, raw } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody)
        return cachedBody;
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw[key]();
    };
    this.raw = request;
    this.path = path;
    __privateSet$1(this, _matchResult, matchResult);
    __privateSet$1(this, _validatedData, {});
  }
  param(key) {
    if (key) {
      const param = __privateGet$1(this, _matchResult)[1] ? __privateGet$1(this, _matchResult)[1][__privateGet$1(this, _matchResult)[0][this.routeIndex][1][key]] : __privateGet$1(this, _matchResult)[0][this.routeIndex][1][key];
      return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
    } else {
      const decoded = {};
      const keys = Object.keys(__privateGet$1(this, _matchResult)[0][this.routeIndex][1]);
      for (let i = 0, len = keys.length; i < len; i++) {
        const key2 = keys[i];
        const value = __privateGet$1(this, _matchResult)[1] ? __privateGet$1(this, _matchResult)[1][__privateGet$1(this, _matchResult)[0][this.routeIndex][1][key2]] : __privateGet$1(this, _matchResult)[0][this.routeIndex][1][key2];
        if (value && typeof value === "string") {
          decoded[key2] = /\%/.test(value) ? decodeURIComponent_(value) : value;
        }
      }
      return decoded;
    }
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name)
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie)
      return;
    const obj = parse(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody)
      return this.bodyCache.parsedBody;
    const parsedBody = await parseBody(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    __privateGet$1(this, _validatedData)[target] = data;
  }
  valid(target) {
    return __privateGet$1(this, _validatedData)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet$1(this, _matchResult)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet$1(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
};
_validatedData = /* @__PURE__ */ new WeakMap();
_matchResult = /* @__PURE__ */ new WeakMap();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError2 = class extends Error {
};
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
function defineDynamicClass() {
  return class {
  };
}
var notFoundHandler = (c2) => {
  return c2.text("404 Not Found", 404);
};
var errorHandler = (err, c2) => {
  if (err instanceof HTTPException2) {
    return err.getResponse();
  }
  console.error(err);
  const message = "Internal Server Error";
  return c2.text(message, 500);
};
var _path;
var _Hono = class extends defineDynamicClass() {
  constructor(options = {}) {
    super();
    this._basePath = "/";
    __privateAdd2(this, _path, "/");
    this.routes = [];
    this.notFoundHandler = notFoundHandler;
    this.errorHandler = errorHandler;
    this.head = () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    };
    this.handleEvent = (event) => {
      return this.dispatch(event.request, event, void 0, event.request.method);
    };
    this.fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    this.request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    this.fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    };
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet2(this, _path, args1);
        } else {
          this.addRoute(method, __privateGet2(this, _path), args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, __privateGet2(this, _path), handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method)
        return this;
      __privateSet2(this, _path, path);
      for (const m2 of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m2.toUpperCase(), __privateGet2(this, _path), handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet2(this, _path, arg1);
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL, __privateGet2(this, _path), handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app2) {
    const subApp = this.basePath(path);
    if (!app2) {
      return subApp;
    }
    app2.routes.map((r) => {
      const handler = app2.errorHandler === errorHandler ? r.handler : async (c2, next) => (await compose([], app2.errorHandler)(c2, () => r.handler(c2, next))).res;
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError(handler) {
    this.errorHandler = handler;
    return this;
  }
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(
        `\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`
      );
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c2, next) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c2) : [c2.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c2.req.url);
      const res = await applicationHandler(
        new Request(
          new URL((c2.req.path.slice(pathPrefixLength) || "/") + queryStrings, c2.req.url),
          c2.req.raw
        ),
        ...optionsArray
      );
      if (res)
        return res;
      await next();
    };
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c2 = new Context(new HonoRequest(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
        });
        if (!res) {
          return this.notFoundHandler(c2);
        }
      } catch (err) {
        return this.handleError(err, c2);
      }
      if (res instanceof Response)
        return res;
      return (async () => {
        let awaited;
        try {
          awaited = await res;
          if (!awaited) {
            return this.notFoundHandler(c2);
          }
        } catch (err) {
          return this.handleError(err, c2);
        }
        return awaited;
      })();
    }
    const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c2);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c2);
      }
    })();
  }
};
var Hono$1 = _Hono;
_path = /* @__PURE__ */ new WeakMap();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
function compareKey(a, b2) {
  if (a.length === 1) {
    return b2.length === 1 ? a < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b2.length ? a < b2 ? -1 : 1 : b2.length - a.length;
}
var Node$1 = class Node3 {
  constructor() {
    this.children = {};
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some(
          (k2) => k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node$1();
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some(
          (k2) => k2.length > 1 && k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node$1();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k2) => {
      const c2 = this.children[k2];
      return (typeof c2.varIndex === "number" ? `(${k2})@${c2.varIndex}` : k2) + c2.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie2 = class {
  constructor() {
    this.context = { varIndex: 0 };
    this.root = new Node$1();
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m2];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j2 = tokens.length - 1; j2 >= 0; j2--) {
        if (tokens[j2].indexOf(mark) !== -1) {
          tokens[j2] = tokens[j2].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var methodNames = [METHOD_NAME_ALL, ...METHODS].map((method) => method.toUpperCase());
var emptyParam = [];
var nullMatcher = [/^$/, [], {}];
var wildcardRegExpCache = {};
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(
    path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}$`
  ));
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
  var _a2;
  const trie = new Trie2();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = {};
  for (let i = 0, j2 = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, {}]), emptyParam];
    } else {
      j2++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j2, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError2(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j2] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = {};
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j2 = 0, len2 = handlerData[i].length; j2 < len2; j2++) {
      const map = (_a2 = handlerData[i][j2]) == null ? void 0 : _a2[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k2 = 0, len3 = keys.length; k2 < len3; k2++) {
        map[keys[k2]] = paramReplacementMap[map[keys[k2]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k2 of Object.keys(middleware).sort((a, b2) => b2.length - a.length)) {
    if (buildWildcardRegExp(k2).test(path)) {
      return [...middleware[k2]];
    }
  }
  return void 0;
}
var RegExpRouter2 = class {
  constructor() {
    this.name = "RegExpRouter";
    this.middleware = { [METHOD_NAME_ALL]: {} };
    this.routes = { [METHOD_NAME_ALL]: {} };
  }
  add(method, path, handler) {
    var _a2;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (methodNames.indexOf(method) === -1)
      methodNames.push(method);
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re2 = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          var _a22;
          (_a22 = middleware[m2])[path] || (_a22[path] = findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
        });
      } else {
        (_a2 = middleware[method])[path] || (_a2[path] = findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re2.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re2.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m2) => {
        var _a22;
        if (method === METHOD_NAME_ALL || method === m2) {
          (_a22 = routes[m2])[path2] || (_a22[path2] = [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ]);
          routes[m2][path2].push([
            handler,
            paths.length === 2 && i === 0 ? paramCount - 1 : paramCount
          ]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
    });
    this.middleware = this.routes = void 0;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter2 = class {
  constructor(init) {
    this.name = "SmartRouter";
    this.routers = [];
    this.routes = [];
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError2) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};
var Node4 = class {
  constructor(method, handler, children) {
    this.order = 0;
    this.params = {};
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m2 = {};
      m2[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m2];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    const parentPatterns = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p2 = parts[i];
      if (Object.keys(curNode.children).includes(p2)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p2];
        const pattern2 = getPattern(p2);
        if (pattern2)
          possibleKeys.push(pattern2[1]);
        continue;
      }
      curNode.children[p2] = new Node4();
      const pattern = getPattern(p2);
      if (pattern) {
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
        possibleKeys.push(pattern[1]);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p2];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m2 = {};
    const handlerSet = {
      handler,
      possibleKeys,
      name: this.name,
      score: this.order
    };
    m2[method] = handlerSet;
    curNode.methods.push(m2);
    return curNode;
  }
  gHSets(node, method, params) {
    const handlerSets = [];
    for (let i = 0, len = node.methods.length; i < len; i++) {
      const m2 = node.methods[i];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      if (handlerSet !== void 0) {
        handlerSet.params = {};
        handlerSet.possibleKeys.map((key) => {
          handlerSet.params[key] = params[key];
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    const params = {};
    this.params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j2 = 0, len2 = curNodes.length; j2 < len2; j2++) {
        const node = curNodes[j2];
        const nextNode = node.children[part];
        if (nextNode) {
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, node.params));
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k2 = 0, len3 = node.patterns.length; k2 < len3; k2++) {
          const pattern = node.patterns[k2];
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "")
            continue;
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, { ...params, ...node.params }));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, { ...params, ...node.params }));
                if (child.children["*"]) {
                  handlerSets.push(
                    ...this.gHSets(child.children["*"], method, { ...params, ...node.params })
                  );
                }
              } else {
                child.params = { ...params };
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b2) => {
      return a.score - b2.score;
    });
    return [results.map(({ handler, params: params2 }) => [handler, params2])];
  }
};
var TrieRouter2 = class {
  constructor() {
    this.name = "TrieRouter";
    this.node = new Node4();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p2 of results) {
        this.node.insert(method, p2, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};
var Hono2 = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter2({
      routers: [new RegExpRouter2(), new TrieRouter2()]
    });
  }
};
const Server = Hono2;
var g;
(function(s15) {
  s15.assertEqual = (n) => n;
  function e(n) {
  }
  s15.assertIs = e;
  function t(n) {
    throw new Error();
  }
  s15.assertNever = t, s15.arrayToEnum = (n) => {
    let a = {};
    for (let i of n)
      a[i] = i;
    return a;
  }, s15.getValidEnumValues = (n) => {
    let a = s15.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), i = {};
    for (let o of a)
      i[o] = n[o];
    return s15.objectValues(i);
  }, s15.objectValues = (n) => s15.objectKeys(n).map(function(a) {
    return n[a];
  }), s15.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    let a = [];
    for (let i in n)
      Object.prototype.hasOwnProperty.call(n, i) && a.push(i);
    return a;
  }, s15.find = (n, a) => {
    for (let i of n)
      if (a(i))
        return i;
  }, s15.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && isFinite(n) && Math.floor(n) === n;
  function r(n, a = " | ") {
    return n.map((i) => typeof i == "string" ? `'${i}'` : i).join(a);
  }
  s15.joinValues = r, s15.jsonStringifyReplacer = (n, a) => typeof a == "bigint" ? a.toString() : a;
})(g || (g = {}));
var ve;
(function(s15) {
  s15.mergeShapes = (e, t) => ({ ...e, ...t });
})(ve || (ve = {}));
var u = g.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]), I = (s15) => {
  switch (typeof s15) {
    case "undefined":
      return u.undefined;
    case "string":
      return u.string;
    case "number":
      return isNaN(s15) ? u.nan : u.number;
    case "boolean":
      return u.boolean;
    case "function":
      return u.function;
    case "bigint":
      return u.bigint;
    case "symbol":
      return u.symbol;
    case "object":
      return Array.isArray(s15) ? u.array : s15 === null ? u.null : s15.then && typeof s15.then == "function" && s15.catch && typeof s15.catch == "function" ? u.promise : typeof Map < "u" && s15 instanceof Map ? u.map : typeof Set < "u" && s15 instanceof Set ? u.set : typeof Date < "u" && s15 instanceof Date ? u.date : u.object;
    default:
      return u.unknown;
  }
}, c = g.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]), Ze = (s15) => JSON.stringify(s15, null, 2).replace(/"([^"]+)":/g, "$1:"), w = class extends Error {
  constructor(e) {
    super(), this.issues = [], this.addIssue = (r) => {
      this.issues = [...this.issues, r];
    }, this.addIssues = (r = []) => {
      this.issues = [...this.issues, ...r];
    };
    let t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  get errors() {
    return this.issues;
  }
  format(e) {
    let t = e || function(a) {
      return a.message;
    }, r = { _errors: [] }, n = (a) => {
      for (let i of a.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n);
        else if (i.code === "invalid_return_type")
          n(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n(i.argumentsError);
        else if (i.path.length === 0)
          r._errors.push(t(i));
        else {
          let o = r, f = 0;
          for (; f < i.path.length; ) {
            let d = i.path[f];
            f === i.path.length - 1 ? (o[d] = o[d] || { _errors: [] }, o[d]._errors.push(t(i))) : o[d] = o[d] || { _errors: [] }, o = o[d], f++;
          }
        }
    };
    return n(this), r;
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, g.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    let t = {}, r = [];
    for (let n of this.issues)
      n.path.length > 0 ? (t[n.path[0]] = t[n.path[0]] || [], t[n.path[0]].push(e(n))) : r.push(e(n));
    return { formErrors: r, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
};
w.create = (s15) => new w(s15);
var ne = (s15, e) => {
  let t;
  switch (s15.code) {
    case c.invalid_type:
      s15.received === u.undefined ? t = "Required" : t = `Expected ${s15.expected}, received ${s15.received}`;
      break;
    case c.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(s15.expected, g.jsonStringifyReplacer)}`;
      break;
    case c.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${g.joinValues(s15.keys, ", ")}`;
      break;
    case c.invalid_union:
      t = "Invalid input";
      break;
    case c.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${g.joinValues(s15.options)}`;
      break;
    case c.invalid_enum_value:
      t = `Invalid enum value. Expected ${g.joinValues(s15.options)}, received '${s15.received}'`;
      break;
    case c.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case c.invalid_return_type:
      t = "Invalid function return type";
      break;
    case c.invalid_date:
      t = "Invalid date";
      break;
    case c.invalid_string:
      typeof s15.validation == "object" ? "includes" in s15.validation ? (t = `Invalid input: must include "${s15.validation.includes}"`, typeof s15.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${s15.validation.position}`)) : "startsWith" in s15.validation ? t = `Invalid input: must start with "${s15.validation.startsWith}"` : "endsWith" in s15.validation ? t = `Invalid input: must end with "${s15.validation.endsWith}"` : g.assertNever(s15.validation) : s15.validation !== "regex" ? t = `Invalid ${s15.validation}` : t = "Invalid";
      break;
    case c.too_small:
      s15.type === "array" ? t = `Array must contain ${s15.exact ? "exactly" : s15.inclusive ? "at least" : "more than"} ${s15.minimum} element(s)` : s15.type === "string" ? t = `String must contain ${s15.exact ? "exactly" : s15.inclusive ? "at least" : "over"} ${s15.minimum} character(s)` : s15.type === "number" ? t = `Number must be ${s15.exact ? "exactly equal to " : s15.inclusive ? "greater than or equal to " : "greater than "}${s15.minimum}` : s15.type === "date" ? t = `Date must be ${s15.exact ? "exactly equal to " : s15.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s15.minimum))}` : t = "Invalid input";
      break;
    case c.too_big:
      s15.type === "array" ? t = `Array must contain ${s15.exact ? "exactly" : s15.inclusive ? "at most" : "less than"} ${s15.maximum} element(s)` : s15.type === "string" ? t = `String must contain ${s15.exact ? "exactly" : s15.inclusive ? "at most" : "under"} ${s15.maximum} character(s)` : s15.type === "number" ? t = `Number must be ${s15.exact ? "exactly" : s15.inclusive ? "less than or equal to" : "less than"} ${s15.maximum}` : s15.type === "bigint" ? t = `BigInt must be ${s15.exact ? "exactly" : s15.inclusive ? "less than or equal to" : "less than"} ${s15.maximum}` : s15.type === "date" ? t = `Date must be ${s15.exact ? "exactly" : s15.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s15.maximum))}` : t = "Invalid input";
      break;
    case c.custom:
      t = "Invalid input";
      break;
    case c.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case c.not_multiple_of:
      t = `Number must be a multiple of ${s15.multipleOf}`;
      break;
    case c.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, g.assertNever(s15);
  }
  return { message: t };
}, we = ne;
function je(s15) {
  we = s15;
}
function ce() {
  return we;
}
var de = (s15) => {
  let { data: e, path: t, errorMaps: r, issueData: n } = s15, a = [...t, ...n.path || []], i = { ...n, path: a }, o = "", f = r.filter((d) => !!d).slice().reverse();
  for (let d of f)
    o = d(i, { data: e, defaultError: o }).message;
  return { ...n, path: a, message: n.message || o };
}, Re = [];
function l(s15, e) {
  let t = de({ issueData: e, data: s15.data, path: s15.path, errorMaps: [s15.common.contextualErrorMap, s15.schemaErrorMap, ce(), ne].filter((r) => !!r) });
  s15.common.issues.push(t);
}
var x = class s {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    let r = [];
    for (let n of t) {
      if (n.status === "aborted")
        return m;
      n.status === "dirty" && e.dirty(), r.push(n.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, t) {
    let r = [];
    for (let n of t)
      r.push({ key: await n.key, value: await n.value });
    return s.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, t) {
    let r = {};
    for (let n of t) {
      let { key: a, value: i } = n;
      if (a.status === "aborted" || i.status === "aborted")
        return m;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || n.alwaysSet) && (r[a.value] = i.value);
    }
    return { status: e.value, value: r };
  }
}, m = Object.freeze({ status: "aborted" }), Te = (s15) => ({ status: "dirty", value: s15 }), k = (s15) => ({ status: "valid", value: s15 }), _e = (s15) => s15.status === "aborted", ge = (s15) => s15.status === "dirty", ae = (s15) => s15.status === "valid", ue = (s15) => typeof Promise < "u" && s15 instanceof Promise, h;
(function(s15) {
  s15.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s15.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(h || (h = {}));
var O = class {
  constructor(e, t, r, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = r, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (this._key instanceof Array ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}, ke = (s15, e) => {
  if (ae(e))
    return { success: true, data: e.value };
  if (!s15.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return { success: false, get error() {
    if (this._error)
      return this._error;
    let t = new w(s15.common.issues);
    return this._error = t, this._error;
  } };
};
function y(s15) {
  if (!s15)
    return {};
  let { errorMap: e, invalid_type_error: t, required_error: r, description: n } = s15;
  if (e && (t || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (i, o) => i.code !== "invalid_type" ? { message: o.defaultError } : typeof o.data > "u" ? { message: r ?? o.defaultError } : { message: t ?? o.defaultError }, description: n };
}
var v = class {
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return I(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || { common: e.parent.common, data: e.data, parsedType: I(e.data), schemaErrorMap: this._def.errorMap, path: e.path, parent: e.parent };
  }
  _processInputParams(e) {
    return { status: new x(), ctx: { common: e.parent.common, data: e.data, parsedType: I(e.data), schemaErrorMap: this._def.errorMap, path: e.path, parent: e.parent } };
  }
  _parseSync(e) {
    let t = this._parse(e);
    if (ue(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    let t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    let r = this.safeParse(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  safeParse(e, t) {
    var r;
    let n = { common: { issues: [], async: (r = t == null ? void 0 : t.async) !== null && r !== void 0 ? r : false, contextualErrorMap: t == null ? void 0 : t.errorMap }, path: (t == null ? void 0 : t.path) || [], schemaErrorMap: this._def.errorMap, parent: null, data: e, parsedType: I(e) }, a = this._parseSync({ data: e, path: n.path, parent: n });
    return ke(n, a);
  }
  async parseAsync(e, t) {
    let r = await this.safeParseAsync(e, t);
    if (r.success)
      return r.data;
    throw r.error;
  }
  async safeParseAsync(e, t) {
    let r = { common: { issues: [], contextualErrorMap: t == null ? void 0 : t.errorMap, async: true }, path: (t == null ? void 0 : t.path) || [], schemaErrorMap: this._def.errorMap, parent: null, data: e, parsedType: I(e) }, n = this._parse({ data: e, path: r.path, parent: r }), a = await (ue(n) ? n : Promise.resolve(n));
    return ke(r, a);
  }
  refine(e, t) {
    let r = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, a) => {
      let i = e(n), o = () => a.addIssue({ code: c.custom, ...r(n) });
      return typeof Promise < "u" && i instanceof Promise ? i.then((f) => f ? true : (o(), false)) : i ? true : (o(), false);
    });
  }
  refinement(e, t) {
    return this._refinement((r, n) => e(r) ? true : (n.addIssue(typeof t == "function" ? t(r, n) : t), false));
  }
  _refinement(e) {
    return new T({ schema: this, typeName: p.ZodEffects, effect: { type: "refinement", refinement: e } });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  optional() {
    return C.create(this, this._def);
  }
  nullable() {
    return R.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return j.create(this, this._def);
  }
  promise() {
    return V.create(this, this._def);
  }
  or(e) {
    return B.create([this, e], this._def);
  }
  and(e) {
    return W.create(this, e, this._def);
  }
  transform(e) {
    return new T({ ...y(this._def), schema: this, typeName: p.ZodEffects, effect: { type: "transform", transform: e } });
  }
  default(e) {
    let t = typeof e == "function" ? e : () => e;
    return new G({ ...y(this._def), innerType: this, defaultValue: t, typeName: p.ZodDefault });
  }
  brand() {
    return new pe({ typeName: p.ZodBranded, type: this, ...y(this._def) });
  }
  catch(e) {
    let t = typeof e == "function" ? e : () => e;
    return new te({ ...y(this._def), innerType: this, catchValue: t, typeName: p.ZodCatch });
  }
  describe(e) {
    let t = this.constructor;
    return new t({ ...this._def, description: e });
  }
  pipe(e) {
    return ie.create(this, e);
  }
  readonly() {
    return re.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}, Ie = /^c[^\s-]{8,}$/i, Ae = /^[a-z][a-z0-9]*$/, Me = /^[0-9A-HJKMNP-TV-Z]{26}$/, Ve = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, $e = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Pe = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", ye, Le = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/, De = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/, ze = (s15) => s15.precision ? s15.offset ? new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${s15.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`) : new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${s15.precision}}Z$`) : s15.precision === 0 ? s15.offset ? new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$") : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$") : s15.offset ? new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$") : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$");
function Ue(s15, e) {
  return !!((e === "v4" || !e) && Le.test(s15) || (e === "v6" || !e) && De.test(s15));
}
var A = class s2 extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== u.string) {
      let a = this._getOrReturnCtx(e);
      return l(a, { code: c.invalid_type, expected: u.string, received: a.parsedType }), m;
    }
    let r = new x(), n;
    for (let a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (n = this._getOrReturnCtx(e, n), l(n, { code: c.too_small, minimum: a.value, type: "string", inclusive: true, exact: false, message: a.message }), r.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (n = this._getOrReturnCtx(e, n), l(n, { code: c.too_big, maximum: a.value, type: "string", inclusive: true, exact: false, message: a.message }), r.dirty());
      else if (a.kind === "length") {
        let i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (n = this._getOrReturnCtx(e, n), i ? l(n, { code: c.too_big, maximum: a.value, type: "string", inclusive: true, exact: true, message: a.message }) : o && l(n, { code: c.too_small, minimum: a.value, type: "string", inclusive: true, exact: true, message: a.message }), r.dirty());
      } else if (a.kind === "email")
        $e.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "email", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "emoji")
        ye || (ye = new RegExp(Pe, "u")), ye.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "emoji", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "uuid")
        Ve.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "uuid", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "cuid")
        Ie.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "cuid", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "cuid2")
        Ae.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "cuid2", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "ulid")
        Me.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "ulid", code: c.invalid_string, message: a.message }), r.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), l(n, { validation: "url", code: c.invalid_string, message: a.message }), r.dirty();
        }
      else
        a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "regex", code: c.invalid_string, message: a.message }), r.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (n = this._getOrReturnCtx(e, n), l(n, { code: c.invalid_string, validation: { includes: a.value, position: a.position }, message: a.message }), r.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (n = this._getOrReturnCtx(e, n), l(n, { code: c.invalid_string, validation: { startsWith: a.value }, message: a.message }), r.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (n = this._getOrReturnCtx(e, n), l(n, { code: c.invalid_string, validation: { endsWith: a.value }, message: a.message }), r.dirty()) : a.kind === "datetime" ? ze(a).test(e.data) || (n = this._getOrReturnCtx(e, n), l(n, { code: c.invalid_string, validation: "datetime", message: a.message }), r.dirty()) : a.kind === "ip" ? Ue(e.data, a.version) || (n = this._getOrReturnCtx(e, n), l(n, { validation: "ip", code: c.invalid_string, message: a.message }), r.dirty()) : g.assertNever(a);
    return { status: r.value, value: e.data };
  }
  _regex(e, t, r) {
    return this.refinement((n) => e.test(n), { validation: t, code: c.invalid_string, ...h.errToObj(r) });
  }
  _addCheck(e) {
    return new s2({ ...this._def, checks: [...this._def.checks, e] });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...h.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...h.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...h.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...h.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...h.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...h.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...h.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...h.errToObj(e) });
  }
  datetime(e) {
    var t;
    return typeof e == "string" ? this._addCheck({ kind: "datetime", precision: null, offset: false, message: e }) : this._addCheck({ kind: "datetime", precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision, offset: (t = e == null ? void 0 : e.offset) !== null && t !== void 0 ? t : false, ...h.errToObj(e == null ? void 0 : e.message) });
  }
  regex(e, t) {
    return this._addCheck({ kind: "regex", regex: e, ...h.errToObj(t) });
  }
  includes(e, t) {
    return this._addCheck({ kind: "includes", value: e, position: t == null ? void 0 : t.position, ...h.errToObj(t == null ? void 0 : t.message) });
  }
  startsWith(e, t) {
    return this._addCheck({ kind: "startsWith", value: e, ...h.errToObj(t) });
  }
  endsWith(e, t) {
    return this._addCheck({ kind: "endsWith", value: e, ...h.errToObj(t) });
  }
  min(e, t) {
    return this._addCheck({ kind: "min", value: e, ...h.errToObj(t) });
  }
  max(e, t) {
    return this._addCheck({ kind: "max", value: e, ...h.errToObj(t) });
  }
  length(e, t) {
    return this._addCheck({ kind: "length", value: e, ...h.errToObj(t) });
  }
  nonempty(e) {
    return this.min(1, h.errToObj(e));
  }
  trim() {
    return new s2({ ...this._def, checks: [...this._def.checks, { kind: "trim" }] });
  }
  toLowerCase() {
    return new s2({ ...this._def, checks: [...this._def.checks, { kind: "toLowerCase" }] });
  }
  toUpperCase() {
    return new s2({ ...this._def, checks: [...this._def.checks, { kind: "toUpperCase" }] });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get minLength() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
};
A.create = (s15) => {
  var e;
  return new A({ checks: [], typeName: p.ZodString, coerce: (e = s15 == null ? void 0 : s15.coerce) !== null && e !== void 0 ? e : false, ...y(s15) });
};
function Be(s15, e) {
  let t = (s15.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, n = t > r ? t : r, a = parseInt(s15.toFixed(n).replace(".", "")), i = parseInt(e.toFixed(n).replace(".", ""));
  return a % i / Math.pow(10, n);
}
var $ = class s3 extends v {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== u.number) {
      let a = this._getOrReturnCtx(e);
      return l(a, { code: c.invalid_type, expected: u.number, received: a.parsedType }), m;
    }
    let r, n = new x();
    for (let a of this._def.checks)
      a.kind === "int" ? g.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), l(r, { code: c.invalid_type, expected: "integer", received: "float", message: a.message }), n.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), l(r, { code: c.too_small, minimum: a.value, type: "number", inclusive: a.inclusive, exact: false, message: a.message }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), l(r, { code: c.too_big, maximum: a.value, type: "number", inclusive: a.inclusive, exact: false, message: a.message }), n.dirty()) : a.kind === "multipleOf" ? Be(e.data, a.value) !== 0 && (r = this._getOrReturnCtx(e, r), l(r, { code: c.not_multiple_of, multipleOf: a.value, message: a.message }), n.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), l(r, { code: c.not_finite, message: a.message }), n.dirty()) : g.assertNever(a);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, true, h.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, false, h.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, true, h.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, false, h.toString(t));
  }
  setLimit(e, t, r, n) {
    return new s3({ ...this._def, checks: [...this._def.checks, { kind: e, value: t, inclusive: r, message: h.toString(n) }] });
  }
  _addCheck(e) {
    return new s3({ ...this._def, checks: [...this._def.checks, e] });
  }
  int(e) {
    return this._addCheck({ kind: "int", message: h.toString(e) });
  }
  positive(e) {
    return this._addCheck({ kind: "min", value: 0, inclusive: false, message: h.toString(e) });
  }
  negative(e) {
    return this._addCheck({ kind: "max", value: 0, inclusive: false, message: h.toString(e) });
  }
  nonpositive(e) {
    return this._addCheck({ kind: "max", value: 0, inclusive: true, message: h.toString(e) });
  }
  nonnegative(e) {
    return this._addCheck({ kind: "min", value: 0, inclusive: true, message: h.toString(e) });
  }
  multipleOf(e, t) {
    return this._addCheck({ kind: "multipleOf", value: e, message: h.toString(t) });
  }
  finite(e) {
    return this._addCheck({ kind: "finite", message: h.toString(e) });
  }
  safe(e) {
    return this._addCheck({ kind: "min", inclusive: true, value: Number.MIN_SAFE_INTEGER, message: h.toString(e) })._addCheck({ kind: "max", inclusive: true, value: Number.MAX_SAFE_INTEGER, message: h.toString(e) });
  }
  get minValue() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && g.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (let r of this._def.checks) {
      if (r.kind === "finite" || r.kind === "int" || r.kind === "multipleOf")
        return true;
      r.kind === "min" ? (t === null || r.value > t) && (t = r.value) : r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
};
$.create = (s15) => new $({ checks: [], typeName: p.ZodNumber, coerce: (s15 == null ? void 0 : s15.coerce) || false, ...y(s15) });
var P = class s4 extends v {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = BigInt(e.data)), this._getType(e) !== u.bigint) {
      let a = this._getOrReturnCtx(e);
      return l(a, { code: c.invalid_type, expected: u.bigint, received: a.parsedType }), m;
    }
    let r, n = new x();
    for (let a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (r = this._getOrReturnCtx(e, r), l(r, { code: c.too_small, type: "bigint", minimum: a.value, inclusive: a.inclusive, message: a.message }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (r = this._getOrReturnCtx(e, r), l(r, { code: c.too_big, type: "bigint", maximum: a.value, inclusive: a.inclusive, message: a.message }), n.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), l(r, { code: c.not_multiple_of, multipleOf: a.value, message: a.message }), n.dirty()) : g.assertNever(a);
    return { status: n.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, true, h.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, false, h.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, true, h.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, false, h.toString(t));
  }
  setLimit(e, t, r, n) {
    return new s4({ ...this._def, checks: [...this._def.checks, { kind: e, value: t, inclusive: r, message: h.toString(n) }] });
  }
  _addCheck(e) {
    return new s4({ ...this._def, checks: [...this._def.checks, e] });
  }
  positive(e) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: false, message: h.toString(e) });
  }
  negative(e) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: false, message: h.toString(e) });
  }
  nonpositive(e) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: true, message: h.toString(e) });
  }
  nonnegative(e) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: true, message: h.toString(e) });
  }
  multipleOf(e, t) {
    return this._addCheck({ kind: "multipleOf", value: e, message: h.toString(t) });
  }
  get minValue() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
};
P.create = (s15) => {
  var e;
  return new P({ checks: [], typeName: p.ZodBigInt, coerce: (e = s15 == null ? void 0 : s15.coerce) !== null && e !== void 0 ? e : false, ...y(s15) });
};
var L = class extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== u.boolean) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.boolean, received: r.parsedType }), m;
    }
    return k(e.data);
  }
};
L.create = (s15) => new L({ typeName: p.ZodBoolean, coerce: (s15 == null ? void 0 : s15.coerce) || false, ...y(s15) });
var D = class s5 extends v {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== u.date) {
      let a = this._getOrReturnCtx(e);
      return l(a, { code: c.invalid_type, expected: u.date, received: a.parsedType }), m;
    }
    if (isNaN(e.data.getTime())) {
      let a = this._getOrReturnCtx(e);
      return l(a, { code: c.invalid_date }), m;
    }
    let r = new x(), n;
    for (let a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (n = this._getOrReturnCtx(e, n), l(n, { code: c.too_small, message: a.message, inclusive: true, exact: false, minimum: a.value, type: "date" }), r.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (n = this._getOrReturnCtx(e, n), l(n, { code: c.too_big, message: a.message, inclusive: true, exact: false, maximum: a.value, type: "date" }), r.dirty()) : g.assertNever(a);
    return { status: r.value, value: new Date(e.data.getTime()) };
  }
  _addCheck(e) {
    return new s5({ ...this._def, checks: [...this._def.checks, e] });
  }
  min(e, t) {
    return this._addCheck({ kind: "min", value: e.getTime(), message: h.toString(t) });
  }
  max(e, t) {
    return this._addCheck({ kind: "max", value: e.getTime(), message: h.toString(t) });
  }
  get minDate() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (let t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
};
D.create = (s15) => new D({ checks: [], coerce: (s15 == null ? void 0 : s15.coerce) || false, typeName: p.ZodDate, ...y(s15) });
var Q = class extends v {
  _parse(e) {
    if (this._getType(e) !== u.symbol) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.symbol, received: r.parsedType }), m;
    }
    return k(e.data);
  }
};
Q.create = (s15) => new Q({ typeName: p.ZodSymbol, ...y(s15) });
var z = class extends v {
  _parse(e) {
    if (this._getType(e) !== u.undefined) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.undefined, received: r.parsedType }), m;
    }
    return k(e.data);
  }
};
z.create = (s15) => new z({ typeName: p.ZodUndefined, ...y(s15) });
var U = class extends v {
  _parse(e) {
    if (this._getType(e) !== u.null) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.null, received: r.parsedType }), m;
    }
    return k(e.data);
  }
};
U.create = (s15) => new U({ typeName: p.ZodNull, ...y(s15) });
var M = class extends v {
  constructor() {
    super(...arguments), this._any = true;
  }
  _parse(e) {
    return k(e.data);
  }
};
M.create = (s15) => new M({ typeName: p.ZodAny, ...y(s15) });
var Z = class extends v {
  constructor() {
    super(...arguments), this._unknown = true;
  }
  _parse(e) {
    return k(e.data);
  }
};
Z.create = (s15) => new Z({ typeName: p.ZodUnknown, ...y(s15) });
var N = class extends v {
  _parse(e) {
    let t = this._getOrReturnCtx(e);
    return l(t, { code: c.invalid_type, expected: u.never, received: t.parsedType }), m;
  }
};
N.create = (s15) => new N({ typeName: p.ZodNever, ...y(s15) });
var K = class extends v {
  _parse(e) {
    if (this._getType(e) !== u.undefined) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.void, received: r.parsedType }), m;
    }
    return k(e.data);
  }
};
K.create = (s15) => new K({ typeName: p.ZodVoid, ...y(s15) });
var j = class s6 extends v {
  _parse(e) {
    let { ctx: t, status: r } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== u.array)
      return l(t, { code: c.invalid_type, expected: u.array, received: t.parsedType }), m;
    if (n.exactLength !== null) {
      let i = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (i || o) && (l(t, { code: i ? c.too_big : c.too_small, minimum: o ? n.exactLength.value : void 0, maximum: i ? n.exactLength.value : void 0, type: "array", inclusive: true, exact: true, message: n.exactLength.message }), r.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (l(t, { code: c.too_small, minimum: n.minLength.value, type: "array", inclusive: true, exact: false, message: n.minLength.message }), r.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (l(t, { code: c.too_big, maximum: n.maxLength.value, type: "array", inclusive: true, exact: false, message: n.maxLength.message }), r.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => n.type._parseAsync(new O(t, i, t.path, o)))).then((i) => x.mergeArray(r, i));
    let a = [...t.data].map((i, o) => n.type._parseSync(new O(t, i, t.path, o)));
    return x.mergeArray(r, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new s6({ ...this._def, minLength: { value: e, message: h.toString(t) } });
  }
  max(e, t) {
    return new s6({ ...this._def, maxLength: { value: e, message: h.toString(t) } });
  }
  length(e, t) {
    return new s6({ ...this._def, exactLength: { value: e, message: h.toString(t) } });
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
j.create = (s15, e) => new j({ type: s15, minLength: null, maxLength: null, exactLength: null, typeName: p.ZodArray, ...y(e) });
function X(s15) {
  if (s15 instanceof b) {
    let e = {};
    for (let t in s15.shape) {
      let r = s15.shape[t];
      e[t] = C.create(X(r));
    }
    return new b({ ...s15._def, shape: () => e });
  } else
    return s15 instanceof j ? new j({ ...s15._def, type: X(s15.element) }) : s15 instanceof C ? C.create(X(s15.unwrap())) : s15 instanceof R ? R.create(X(s15.unwrap())) : s15 instanceof E ? E.create(s15.items.map((e) => X(e))) : s15;
}
var b = class s7 extends v {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    let e = this._def.shape(), t = g.objectKeys(e);
    return this._cached = { shape: e, keys: t };
  }
  _parse(e) {
    if (this._getType(e) !== u.object) {
      let d = this._getOrReturnCtx(e);
      return l(d, { code: c.invalid_type, expected: u.object, received: d.parsedType }), m;
    }
    let { status: r, ctx: n } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof N && this._def.unknownKeys === "strip"))
      for (let d in n.data)
        i.includes(d) || o.push(d);
    let f = [];
    for (let d of i) {
      let _ = a[d], S = n.data[d];
      f.push({ key: { status: "valid", value: d }, value: _._parse(new O(n, S, n.path, d)), alwaysSet: d in n.data });
    }
    if (this._def.catchall instanceof N) {
      let d = this._def.unknownKeys;
      if (d === "passthrough")
        for (let _ of o)
          f.push({ key: { status: "valid", value: _ }, value: { status: "valid", value: n.data[_] } });
      else if (d === "strict")
        o.length > 0 && (l(n, { code: c.unrecognized_keys, keys: o }), r.dirty());
      else if (d !== "strip")
        throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      let d = this._def.catchall;
      for (let _ of o) {
        let S = n.data[_];
        f.push({ key: { status: "valid", value: _ }, value: d._parse(new O(n, S, n.path, _)), alwaysSet: _ in n.data });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      let d = [];
      for (let _ of f) {
        let S = await _.key;
        d.push({ key: S, value: await _.value, alwaysSet: _.alwaysSet });
      }
      return d;
    }).then((d) => x.mergeObjectSync(r, d)) : x.mergeObjectSync(r, f);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return h.errToObj, new s7({ ...this._def, unknownKeys: "strict", ...e !== void 0 ? { errorMap: (t, r) => {
      var n, a, i, o;
      let f = (i = (a = (n = this._def).errorMap) === null || a === void 0 ? void 0 : a.call(n, t, r).message) !== null && i !== void 0 ? i : r.defaultError;
      return t.code === "unrecognized_keys" ? { message: (o = h.errToObj(e).message) !== null && o !== void 0 ? o : f } : { message: f };
    } } : {} });
  }
  strip() {
    return new s7({ ...this._def, unknownKeys: "strip" });
  }
  passthrough() {
    return new s7({ ...this._def, unknownKeys: "passthrough" });
  }
  extend(e) {
    return new s7({ ...this._def, shape: () => ({ ...this._def.shape(), ...e }) });
  }
  merge(e) {
    return new s7({ unknownKeys: e._def.unknownKeys, catchall: e._def.catchall, shape: () => ({ ...this._def.shape(), ...e._def.shape() }), typeName: p.ZodObject });
  }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  catchall(e) {
    return new s7({ ...this._def, catchall: e });
  }
  pick(e) {
    let t = {};
    return g.objectKeys(e).forEach((r) => {
      e[r] && this.shape[r] && (t[r] = this.shape[r]);
    }), new s7({ ...this._def, shape: () => t });
  }
  omit(e) {
    let t = {};
    return g.objectKeys(this.shape).forEach((r) => {
      e[r] || (t[r] = this.shape[r]);
    }), new s7({ ...this._def, shape: () => t });
  }
  deepPartial() {
    return X(this);
  }
  partial(e) {
    let t = {};
    return g.objectKeys(this.shape).forEach((r) => {
      let n = this.shape[r];
      e && !e[r] ? t[r] = n : t[r] = n.optional();
    }), new s7({ ...this._def, shape: () => t });
  }
  required(e) {
    let t = {};
    return g.objectKeys(this.shape).forEach((r) => {
      if (e && !e[r])
        t[r] = this.shape[r];
      else {
        let a = this.shape[r];
        for (; a instanceof C; )
          a = a._def.innerType;
        t[r] = a;
      }
    }), new s7({ ...this._def, shape: () => t });
  }
  keyof() {
    return Se(g.objectKeys(this.shape));
  }
};
b.create = (s15, e) => new b({ shape: () => s15, unknownKeys: "strip", catchall: N.create(), typeName: p.ZodObject, ...y(e) });
b.strictCreate = (s15, e) => new b({ shape: () => s15, unknownKeys: "strict", catchall: N.create(), typeName: p.ZodObject, ...y(e) });
b.lazycreate = (s15, e) => new b({ shape: s15, unknownKeys: "strip", catchall: N.create(), typeName: p.ZodObject, ...y(e) });
var B = class extends v {
  _parse(e) {
    let { ctx: t } = this._processInputParams(e), r = this._def.options;
    function n(a) {
      for (let o of a)
        if (o.result.status === "valid")
          return o.result;
      for (let o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      let i = a.map((o) => new w(o.ctx.common.issues));
      return l(t, { code: c.invalid_union, unionErrors: i }), m;
    }
    if (t.common.async)
      return Promise.all(r.map(async (a) => {
        let i = { ...t, common: { ...t.common, issues: [] }, parent: null };
        return { result: await a._parseAsync({ data: t.data, path: t.path, parent: i }), ctx: i };
      })).then(n);
    {
      let a, i = [];
      for (let f of r) {
        let d = { ...t, common: { ...t.common, issues: [] }, parent: null }, _ = f._parseSync({ data: t.data, path: t.path, parent: d });
        if (_.status === "valid")
          return _;
        _.status === "dirty" && !a && (a = { result: _, ctx: d }), d.common.issues.length && i.push(d.common.issues);
      }
      if (a)
        return t.common.issues.push(...a.ctx.common.issues), a.result;
      let o = i.map((f) => new w(f));
      return l(t, { code: c.invalid_union, unionErrors: o }), m;
    }
  }
  get options() {
    return this._def.options;
  }
};
B.create = (s15, e) => new B({ options: s15, typeName: p.ZodUnion, ...y(e) });
var oe = (s15) => s15 instanceof q ? oe(s15.schema) : s15 instanceof T ? oe(s15.innerType()) : s15 instanceof J ? [s15.value] : s15 instanceof Y ? s15.options : s15 instanceof H ? Object.keys(s15.enum) : s15 instanceof G ? oe(s15._def.innerType) : s15 instanceof z ? [void 0] : s15 instanceof U ? [null] : null, le = class s8 extends v {
  _parse(e) {
    let { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== u.object)
      return l(t, { code: c.invalid_type, expected: u.object, received: t.parsedType }), m;
    let r = this.discriminator, n = t.data[r], a = this.optionsMap.get(n);
    return a ? t.common.async ? a._parseAsync({ data: t.data, path: t.path, parent: t }) : a._parseSync({ data: t.data, path: t.path, parent: t }) : (l(t, { code: c.invalid_union_discriminator, options: Array.from(this.optionsMap.keys()), path: [r] }), m);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(e, t, r) {
    let n = /* @__PURE__ */ new Map();
    for (let a of t) {
      let i = oe(a.shape[e]);
      if (!i)
        throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);
      for (let o of i) {
        if (n.has(o))
          throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(o)}`);
        n.set(o, a);
      }
    }
    return new s8({ typeName: p.ZodDiscriminatedUnion, discriminator: e, options: t, optionsMap: n, ...y(r) });
  }
};
function xe(s15, e) {
  let t = I(s15), r = I(e);
  if (s15 === e)
    return { valid: true, data: s15 };
  if (t === u.object && r === u.object) {
    let n = g.objectKeys(e), a = g.objectKeys(s15).filter((o) => n.indexOf(o) !== -1), i = { ...s15, ...e };
    for (let o of a) {
      let f = xe(s15[o], e[o]);
      if (!f.valid)
        return { valid: false };
      i[o] = f.data;
    }
    return { valid: true, data: i };
  } else if (t === u.array && r === u.array) {
    if (s15.length !== e.length)
      return { valid: false };
    let n = [];
    for (let a = 0; a < s15.length; a++) {
      let i = s15[a], o = e[a], f = xe(i, o);
      if (!f.valid)
        return { valid: false };
      n.push(f.data);
    }
    return { valid: true, data: n };
  } else
    return t === u.date && r === u.date && +s15 == +e ? { valid: true, data: s15 } : { valid: false };
}
var W = class extends v {
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e), n = (a, i) => {
      if (_e(a) || _e(i))
        return m;
      let o = xe(a.value, i.value);
      return o.valid ? ((ge(a) || ge(i)) && t.dirty(), { status: t.value, value: o.data }) : (l(r, { code: c.invalid_intersection_types }), m);
    };
    return r.common.async ? Promise.all([this._def.left._parseAsync({ data: r.data, path: r.path, parent: r }), this._def.right._parseAsync({ data: r.data, path: r.path, parent: r })]).then(([a, i]) => n(a, i)) : n(this._def.left._parseSync({ data: r.data, path: r.path, parent: r }), this._def.right._parseSync({ data: r.data, path: r.path, parent: r }));
  }
};
W.create = (s15, e, t) => new W({ left: s15, right: e, typeName: p.ZodIntersection, ...y(t) });
var E = class s9 extends v {
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== u.array)
      return l(r, { code: c.invalid_type, expected: u.array, received: r.parsedType }), m;
    if (r.data.length < this._def.items.length)
      return l(r, { code: c.too_small, minimum: this._def.items.length, inclusive: true, exact: false, type: "array" }), m;
    !this._def.rest && r.data.length > this._def.items.length && (l(r, { code: c.too_big, maximum: this._def.items.length, inclusive: true, exact: false, type: "array" }), t.dirty());
    let a = [...r.data].map((i, o) => {
      let f = this._def.items[o] || this._def.rest;
      return f ? f._parse(new O(r, i, r.path, o)) : null;
    }).filter((i) => !!i);
    return r.common.async ? Promise.all(a).then((i) => x.mergeArray(t, i)) : x.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new s9({ ...this._def, rest: e });
  }
};
E.create = (s15, e) => {
  if (!Array.isArray(s15))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new E({ items: s15, typeName: p.ZodTuple, rest: null, ...y(e) });
};
var fe = class s10 extends v {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== u.object)
      return l(r, { code: c.invalid_type, expected: u.object, received: r.parsedType }), m;
    let n = [], a = this._def.keyType, i = this._def.valueType;
    for (let o in r.data)
      n.push({ key: a._parse(new O(r, o, r.path, o)), value: i._parse(new O(r, r.data[o], r.path, o)) });
    return r.common.async ? x.mergeObjectAsync(t, n) : x.mergeObjectSync(t, n);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, r) {
    return t instanceof v ? new s10({ keyType: e, valueType: t, typeName: p.ZodRecord, ...y(r) }) : new s10({ keyType: A.create(), valueType: e, typeName: p.ZodRecord, ...y(t) });
  }
}, F = class extends v {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== u.map)
      return l(r, { code: c.invalid_type, expected: u.map, received: r.parsedType }), m;
    let n = this._def.keyType, a = this._def.valueType, i = [...r.data.entries()].map(([o, f], d) => ({ key: n._parse(new O(r, o, r.path, [d, "key"])), value: a._parse(new O(r, f, r.path, [d, "value"])) }));
    if (r.common.async) {
      let o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (let f of i) {
          let d = await f.key, _ = await f.value;
          if (d.status === "aborted" || _.status === "aborted")
            return m;
          (d.status === "dirty" || _.status === "dirty") && t.dirty(), o.set(d.value, _.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      let o = /* @__PURE__ */ new Map();
      for (let f of i) {
        let d = f.key, _ = f.value;
        if (d.status === "aborted" || _.status === "aborted")
          return m;
        (d.status === "dirty" || _.status === "dirty") && t.dirty(), o.set(d.value, _.value);
      }
      return { status: t.value, value: o };
    }
  }
};
F.create = (s15, e, t) => new F({ valueType: e, keyType: s15, typeName: p.ZodMap, ...y(t) });
var ee = class s11 extends v {
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== u.set)
      return l(r, { code: c.invalid_type, expected: u.set, received: r.parsedType }), m;
    let n = this._def;
    n.minSize !== null && r.data.size < n.minSize.value && (l(r, { code: c.too_small, minimum: n.minSize.value, type: "set", inclusive: true, exact: false, message: n.minSize.message }), t.dirty()), n.maxSize !== null && r.data.size > n.maxSize.value && (l(r, { code: c.too_big, maximum: n.maxSize.value, type: "set", inclusive: true, exact: false, message: n.maxSize.message }), t.dirty());
    let a = this._def.valueType;
    function i(f) {
      let d = /* @__PURE__ */ new Set();
      for (let _ of f) {
        if (_.status === "aborted")
          return m;
        _.status === "dirty" && t.dirty(), d.add(_.value);
      }
      return { status: t.value, value: d };
    }
    let o = [...r.data.values()].map((f, d) => a._parse(new O(r, f, r.path, d)));
    return r.common.async ? Promise.all(o).then((f) => i(f)) : i(o);
  }
  min(e, t) {
    return new s11({ ...this._def, minSize: { value: e, message: h.toString(t) } });
  }
  max(e, t) {
    return new s11({ ...this._def, maxSize: { value: e, message: h.toString(t) } });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
};
ee.create = (s15, e) => new ee({ valueType: s15, minSize: null, maxSize: null, typeName: p.ZodSet, ...y(e) });
var he = class s12 extends v {
  constructor() {
    super(...arguments), this.validate = this.implement;
  }
  _parse(e) {
    let { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== u.function)
      return l(t, { code: c.invalid_type, expected: u.function, received: t.parsedType }), m;
    function r(o, f) {
      return de({ data: o, path: t.path, errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, ce(), ne].filter((d) => !!d), issueData: { code: c.invalid_arguments, argumentsError: f } });
    }
    function n(o, f) {
      return de({ data: o, path: t.path, errorMaps: [t.common.contextualErrorMap, t.schemaErrorMap, ce(), ne].filter((d) => !!d), issueData: { code: c.invalid_return_type, returnTypeError: f } });
    }
    let a = { errorMap: t.common.contextualErrorMap }, i = t.data;
    if (this._def.returns instanceof V) {
      let o = this;
      return k(async function(...f) {
        let d = new w([]), _ = await o._def.args.parseAsync(f, a).catch((me) => {
          throw d.addIssue(r(f, me)), d;
        }), S = await Reflect.apply(i, this, _);
        return await o._def.returns._def.type.parseAsync(S, a).catch((me) => {
          throw d.addIssue(n(S, me)), d;
        });
      });
    } else {
      let o = this;
      return k(function(...f) {
        let d = o._def.args.safeParse(f, a);
        if (!d.success)
          throw new w([r(f, d.error)]);
        let _ = Reflect.apply(i, this, d.data), S = o._def.returns.safeParse(_, a);
        if (!S.success)
          throw new w([n(_, S.error)]);
        return S.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e) {
    return new s12({ ...this._def, args: E.create(e).rest(Z.create()) });
  }
  returns(e) {
    return new s12({ ...this._def, returns: e });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(e, t, r) {
    return new s12({ args: e || E.create([]).rest(Z.create()), returns: t || Z.create(), typeName: p.ZodFunction, ...y(r) });
  }
}, q = class extends v {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    let { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
};
q.create = (s15, e) => new q({ getter: s15, typeName: p.ZodLazy, ...y(e) });
var J = class extends v {
  _parse(e) {
    if (e.data !== this._def.value) {
      let t = this._getOrReturnCtx(e);
      return l(t, { received: t.data, code: c.invalid_literal, expected: this._def.value }), m;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
};
J.create = (s15, e) => new J({ value: s15, typeName: p.ZodLiteral, ...y(e) });
function Se(s15, e) {
  return new Y({ values: s15, typeName: p.ZodEnum, ...y(e) });
}
var Y = class s13 extends v {
  _parse(e) {
    if (typeof e.data != "string") {
      let t = this._getOrReturnCtx(e), r = this._def.values;
      return l(t, { expected: g.joinValues(r), received: t.parsedType, code: c.invalid_type }), m;
    }
    if (this._def.values.indexOf(e.data) === -1) {
      let t = this._getOrReturnCtx(e), r = this._def.values;
      return l(t, { received: t.data, code: c.invalid_enum_value, options: r }), m;
    }
    return k(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    let e = {};
    for (let t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    let e = {};
    for (let t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    let e = {};
    for (let t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e) {
    return s13.create(e);
  }
  exclude(e) {
    return s13.create(this.options.filter((t) => !e.includes(t)));
  }
};
Y.create = Se;
var H = class extends v {
  _parse(e) {
    let t = g.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== u.string && r.parsedType !== u.number) {
      let n = g.objectValues(t);
      return l(r, { expected: g.joinValues(n), received: r.parsedType, code: c.invalid_type }), m;
    }
    if (t.indexOf(e.data) === -1) {
      let n = g.objectValues(t);
      return l(r, { received: r.data, code: c.invalid_enum_value, options: n }), m;
    }
    return k(e.data);
  }
  get enum() {
    return this._def.values;
  }
};
H.create = (s15, e) => new H({ values: s15, typeName: p.ZodNativeEnum, ...y(e) });
var V = class extends v {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    let { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== u.promise && t.common.async === false)
      return l(t, { code: c.invalid_type, expected: u.promise, received: t.parsedType }), m;
    let r = t.parsedType === u.promise ? t.data : Promise.resolve(t.data);
    return k(r.then((n) => this._def.type.parseAsync(n, { path: t.path, errorMap: t.common.contextualErrorMap })));
  }
};
V.create = (s15, e) => new V({ type: s15, typeName: p.ZodPromise, ...y(e) });
var T = class extends v {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === p.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e), n = this._def.effect || null, a = { addIssue: (i) => {
      l(r, i), i.fatal ? t.abort() : t.dirty();
    }, get path() {
      return r.path;
    } };
    if (a.addIssue = a.addIssue.bind(a), n.type === "preprocess") {
      let i = n.transform(r.data, a);
      return r.common.issues.length ? { status: "dirty", value: r.data } : r.common.async ? Promise.resolve(i).then((o) => this._def.schema._parseAsync({ data: o, path: r.path, parent: r })) : this._def.schema._parseSync({ data: i, path: r.path, parent: r });
    }
    if (n.type === "refinement") {
      let i = (o) => {
        let f = n.refinement(o, a);
        if (r.common.async)
          return Promise.resolve(f);
        if (f instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (r.common.async === false) {
        let o = this._def.schema._parseSync({ data: r.data, path: r.path, parent: r });
        return o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (n.type === "transform")
      if (r.common.async === false) {
        let i = this._def.schema._parseSync({ data: r.data, path: r.path, parent: r });
        if (!ae(i))
          return i;
        let o = n.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((i) => ae(i) ? Promise.resolve(n.transform(i.value, a)).then((o) => ({ status: t.value, value: o })) : i);
    g.assertNever(n);
  }
};
T.create = (s15, e, t) => new T({ schema: s15, typeName: p.ZodEffects, effect: e, ...y(t) });
T.createWithPreprocess = (s15, e, t) => new T({ schema: e, effect: { type: "preprocess", transform: s15 }, typeName: p.ZodEffects, ...y(t) });
var C = class extends v {
  _parse(e) {
    return this._getType(e) === u.undefined ? k(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
C.create = (s15, e) => new C({ innerType: s15, typeName: p.ZodOptional, ...y(e) });
var R = class extends v {
  _parse(e) {
    return this._getType(e) === u.null ? k(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
};
R.create = (s15, e) => new R({ innerType: s15, typeName: p.ZodNullable, ...y(e) });
var G = class extends v {
  _parse(e) {
    let { ctx: t } = this._processInputParams(e), r = t.data;
    return t.parsedType === u.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({ data: r, path: t.path, parent: t });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
G.create = (s15, e) => new G({ innerType: s15, typeName: p.ZodDefault, defaultValue: typeof e.default == "function" ? e.default : () => e.default, ...y(e) });
var te = class extends v {
  _parse(e) {
    let { ctx: t } = this._processInputParams(e), r = { ...t, common: { ...t.common, issues: [] } }, n = this._def.innerType._parse({ data: r.data, path: r.path, parent: { ...r } });
    return ue(n) ? n.then((a) => ({ status: "valid", value: a.status === "valid" ? a.value : this._def.catchValue({ get error() {
      return new w(r.common.issues);
    }, input: r.data }) })) : { status: "valid", value: n.status === "valid" ? n.value : this._def.catchValue({ get error() {
      return new w(r.common.issues);
    }, input: r.data }) };
  }
  removeCatch() {
    return this._def.innerType;
  }
};
te.create = (s15, e) => new te({ innerType: s15, typeName: p.ZodCatch, catchValue: typeof e.catch == "function" ? e.catch : () => e.catch, ...y(e) });
var se = class extends v {
  _parse(e) {
    if (this._getType(e) !== u.nan) {
      let r = this._getOrReturnCtx(e);
      return l(r, { code: c.invalid_type, expected: u.nan, received: r.parsedType }), m;
    }
    return { status: "valid", value: e.data };
  }
};
se.create = (s15) => new se({ typeName: p.ZodNaN, ...y(s15) });
var We = Symbol("zod_brand"), pe = class extends v {
  _parse(e) {
    let { ctx: t } = this._processInputParams(e), r = t.data;
    return this._def.type._parse({ data: r, path: t.path, parent: t });
  }
  unwrap() {
    return this._def.type;
  }
}, ie = class s14 extends v {
  _parse(e) {
    let { status: t, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        let a = await this._def.in._parseAsync({ data: r.data, path: r.path, parent: r });
        return a.status === "aborted" ? m : a.status === "dirty" ? (t.dirty(), Te(a.value)) : this._def.out._parseAsync({ data: a.value, path: r.path, parent: r });
      })();
    {
      let n = this._def.in._parseSync({ data: r.data, path: r.path, parent: r });
      return n.status === "aborted" ? m : n.status === "dirty" ? (t.dirty(), { status: "dirty", value: n.value }) : this._def.out._parseSync({ data: n.value, path: r.path, parent: r });
    }
  }
  static create(e, t) {
    return new s14({ in: e, out: t, typeName: p.ZodPipeline });
  }
}, re = class extends v {
  _parse(e) {
    let t = this._def.innerType._parse(e);
    return ae(t) && (t.value = Object.freeze(t.value)), t;
  }
};
re.create = (s15, e) => new re({ innerType: s15, typeName: p.ZodReadonly, ...y(e) });
var Oe = (s15, e = {}, t) => s15 ? M.create().superRefine((r, n) => {
  var a, i;
  if (!s15(r)) {
    let o = typeof e == "function" ? e(r) : typeof e == "string" ? { message: e } : e, f = (i = (a = o.fatal) !== null && a !== void 0 ? a : t) !== null && i !== void 0 ? i : true, d = typeof o == "string" ? { message: o } : o;
    n.addIssue({ code: "custom", ...d, fatal: f });
  }
}) : M.create(), qe = { object: b.lazycreate }, p;
(function(s15) {
  s15.ZodString = "ZodString", s15.ZodNumber = "ZodNumber", s15.ZodNaN = "ZodNaN", s15.ZodBigInt = "ZodBigInt", s15.ZodBoolean = "ZodBoolean", s15.ZodDate = "ZodDate", s15.ZodSymbol = "ZodSymbol", s15.ZodUndefined = "ZodUndefined", s15.ZodNull = "ZodNull", s15.ZodAny = "ZodAny", s15.ZodUnknown = "ZodUnknown", s15.ZodNever = "ZodNever", s15.ZodVoid = "ZodVoid", s15.ZodArray = "ZodArray", s15.ZodObject = "ZodObject", s15.ZodUnion = "ZodUnion", s15.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s15.ZodIntersection = "ZodIntersection", s15.ZodTuple = "ZodTuple", s15.ZodRecord = "ZodRecord", s15.ZodMap = "ZodMap", s15.ZodSet = "ZodSet", s15.ZodFunction = "ZodFunction", s15.ZodLazy = "ZodLazy", s15.ZodLiteral = "ZodLiteral", s15.ZodEnum = "ZodEnum", s15.ZodEffects = "ZodEffects", s15.ZodNativeEnum = "ZodNativeEnum", s15.ZodOptional = "ZodOptional", s15.ZodNullable = "ZodNullable", s15.ZodDefault = "ZodDefault", s15.ZodCatch = "ZodCatch", s15.ZodPromise = "ZodPromise", s15.ZodBranded = "ZodBranded", s15.ZodPipeline = "ZodPipeline", s15.ZodReadonly = "ZodReadonly";
})(p || (p = {}));
var Je = (s15, e = { message: `Input not instance of ${s15.name}` }) => Oe((t) => t instanceof s15, e), Ce = A.create, Ne = $.create, Ye = se.create, He = P.create, Ee = L.create, Ge = D.create, Xe = Q.create, Qe = z.create, Ke = U.create, Fe = M.create, et = Z.create, tt = N.create, st = K.create, rt = j.create, nt = b.create, at = b.strictCreate, it = B.create, ot = le.create, ct = W.create, dt = E.create, ut = fe.create, lt = F.create, ft = ee.create, ht = he.create, pt = q.create, mt = J.create, yt = Y.create, vt = H.create, _t = V.create, be = T.create, gt = C.create, xt = R.create, kt = T.createWithPreprocess, bt = ie.create, wt = () => Ce().optional(), Tt = () => Ne().optional(), St = () => Ee().optional(), Ot = { string: (s15) => A.create({ ...s15, coerce: true }), number: (s15) => $.create({ ...s15, coerce: true }), boolean: (s15) => L.create({ ...s15, coerce: true }), bigint: (s15) => P.create({ ...s15, coerce: true }), date: (s15) => D.create({ ...s15, coerce: true }) }, Ct = m, Et = Object.freeze({ __proto__: null, defaultErrorMap: ne, setErrorMap: je, getErrorMap: ce, makeIssue: de, EMPTY_PATH: Re, addIssueToContext: l, ParseStatus: x, INVALID: m, DIRTY: Te, OK: k, isAborted: _e, isDirty: ge, isValid: ae, isAsync: ue, get util() {
  return g;
}, get objectUtil() {
  return ve;
}, ZodParsedType: u, getParsedType: I, ZodType: v, ZodString: A, ZodNumber: $, ZodBigInt: P, ZodBoolean: L, ZodDate: D, ZodSymbol: Q, ZodUndefined: z, ZodNull: U, ZodAny: M, ZodUnknown: Z, ZodNever: N, ZodVoid: K, ZodArray: j, ZodObject: b, ZodUnion: B, ZodDiscriminatedUnion: le, ZodIntersection: W, ZodTuple: E, ZodRecord: fe, ZodMap: F, ZodSet: ee, ZodFunction: he, ZodLazy: q, ZodLiteral: J, ZodEnum: Y, ZodNativeEnum: H, ZodPromise: V, ZodEffects: T, ZodTransformer: T, ZodOptional: C, ZodNullable: R, ZodDefault: G, ZodCatch: te, ZodNaN: se, BRAND: We, ZodBranded: pe, ZodPipeline: ie, ZodReadonly: re, custom: Oe, Schema: v, ZodSchema: v, late: qe, get ZodFirstPartyTypeKind() {
  return p;
}, coerce: Ot, any: Fe, array: rt, bigint: He, boolean: Ee, date: Ge, discriminatedUnion: ot, effect: be, enum: yt, function: ht, instanceof: Je, intersection: ct, lazy: pt, literal: mt, map: lt, nan: Ye, nativeEnum: vt, never: tt, null: Ke, nullable: xt, number: Ne, object: nt, oboolean: St, onumber: Tt, optional: gt, ostring: wt, pipeline: bt, preprocess: kt, promise: _t, record: ut, set: ft, strictObject: at, string: Ce, symbol: Xe, transformer: be, tuple: dt, undefined: Qe, union: it, unknown: et, void: st, NEVER: Ct, ZodIssueCode: c, quotelessJson: Ze, ZodError: w });
console.log(Et);
const app = new Server();
app.get("/ping", (c2) => c2.json({ hello: "pong" }));
app.get("/dyn", async (c2) => {
  const { dyn: dyn2 } = await Promise.resolve().then(() => dynamic);
  return c2.json({ dyn: dyn2 });
});
const server = new Hono$2();
server.route("/", app);
const entryEdge = server.fetch;
const config = {
  path: "*"
};
const dyn = "dynamic";
const dynamic = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dyn
}, Symbol.toStringTag, { value: "Module" }));
export {
  config,
  entryEdge as default
};
