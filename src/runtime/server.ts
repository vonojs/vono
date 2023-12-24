import { type Context, Hono } from "hono";

export function notfound() {
  return new Response("not found", { status: 404 });
}
export function redirect(url: string, status: number = 302) {
  return new Response(null, {
    headers: {
      location: url,
    },
    status,
  });
}
export function json(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
    },
    status,
  });
}
export function html(data: string, status: number = 200) {
  return new Response(data, {
    headers: {
      "content-type": "text/html",
    },
    status,
  });
}
class Server {
  hono = new Hono();
  handleRequest = async (c: Context, handler: any) => {
    try {
      const result = await handler(c.req.raw);
      if (result instanceof Response) return result;
      if (typeof result === "object") return c.json(result);
      if (typeof result === "string") return c.html(result);
      if (result instanceof ReadableStream) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream",
          },
        });
      }
      if (result instanceof ArrayBuffer) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream",
          },
        });
      }
      if (result instanceof Blob) {
        return new Response(result, {
          headers: {
            "content-type": "application/octet-stream",
          },
        });
      }
      if (result instanceof Error) {
        // log.error("server:", result.message);
        return c.json({ error: result.message }, 500);
      }
      return new Response(result);
    } catch (e) {
      if (e instanceof Error) {
        // log.error("server:", e.message);
        return c.text('internal server error', 500);
      }
      if (e instanceof Response) {
        return e;
      }
    }
    return new Response("internal server error", { status: 500 });
  };
  get = (path: string, handler: (r: Request) => any) => {
    this.hono.get(path, (c) => {
      return this.handleRequest(c, handler);
    });
  };
  post = (path: string, handler: (r: Request) => any) => {
    this.hono.post(path, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  put = (path: string, handler: (r: Request) => any) => {
    this.hono.put(path, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  patch = (path: string, handler: (r: Request) => any) => {
    this.hono.patch(path, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  delete = (path: string, handler: (r: Request) => any) => {
    this.hono.delete(path, async (c) => {
      return this.handleRequest(c, handler);
    });
  };
  use: Hono["use"];
  route: Hono["route"];
  fire: Hono["fire"];
  fetch: Hono["fetch"];
  routes = this.hono.routes;
  constructor() {
    this.use = this.hono.use.bind(this.hono);
    this.route = this.hono.route.bind(this.hono);
    this.fire = this.hono.fire.bind(this.hono);
    this.fetch = this.hono.fetch.bind(this.hono);
  }
}
export default Server;
export { Server };