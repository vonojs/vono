import * as fs from "fs/promises";
import { createLogger } from "@gaiiaa/logger";

const logger = createLogger({
  name: "PRERENDER",
  level: 1,
});

function isRedirect(res: Response) {
  return res.status >= 300 && res.status < 400;
}

export async function prerender(args: {
  routes: Array<string>;
  handler: (req: Request) => Response | Promise<Response>;
  outDir: string;
}) {
  fs.mkdir(args.outDir, { recursive: true });
  await Promise.allSettled(args.routes.map(async (route) => {
    const res = await args.handler(
      new Request(new URL(route, "http://localhost")),
    );
    if (res.status !== 200) {
      if (isRedirect(res)) {
        logger.warn(`skipping ${route} due to redirect`);
        return;
      }
      logger.error (`error prerendering ${route}; Status: ${res.status}`);
      return;
    }
    try {
      const t = performance.now();
      const output = await res.text();
      const url = new URL(route, "http://localhost");
      const path = url.pathname === "/"
        ? "/index.html"
        : url.pathname + ".html";
      await fs.writeFile(args.outDir + path, output);
      logger.success(`prerendered route "${route}" in ${(performance.now() - t).toFixed(1)}ms`);
    } catch (e) {
      logger.error(`error prerendering ${route}; ${e}`);
      return;
    }
  }));
}
