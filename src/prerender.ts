import * as fs from "fs/promises";

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
        console.log(`Skipping ${route} due to redirect`);
        return;
      }
      console.error(`Error prerendering ${route}; Status: ${res.status}`);
      return;
    }
    try {
      const output = await res.text();
      const url = new URL(route, "http://localhost");
      const path = url.pathname === "/"
        ? "/index.html"
        : url.pathname + ".html";
      await fs.writeFile(args.outDir + path, output);
    } catch (e) {
      console.error(`Error prerendering ${route}; ${e}`);
      return;
    }
  }));
}
