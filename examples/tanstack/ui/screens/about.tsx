import { Route } from "@tanstack/react-router";
import rpc from "#vono/rpc"
import rootRoute from "../root";

const aboutRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/about",
  loader: async () => {
    return rpc.api.about.$get().then((res) => res.json())
  },
	component: UI,
});

export default aboutRoute;

function UI() {
  const data = aboutRoute.useLoaderData()
  return <div className="p-2">Hello from About! {JSON.stringify(data)}</div>;
}