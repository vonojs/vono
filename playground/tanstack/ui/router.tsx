import indexRoute from "./screens/index";
import aboutRoute from "./screens/about";
import rootRoute from "./root";
import { Router } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

export const createRouter = () => new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
