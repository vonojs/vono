import { Route } from "@tanstack/react-router";
import rootRoute from "../root";

const route = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: UI,
});

export default route;

function UI() {
  return (
    <div>
      <h3>Vono x Tanstack</h3>
    </div>
  );
}