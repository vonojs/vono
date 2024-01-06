import { Link, Outlet, RootRoute } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";

export default new RootRoute({
	component: () => (
		<>
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
			<hr />
			<Outlet />
			<DehydrateRouter />
		</>
	),
});
