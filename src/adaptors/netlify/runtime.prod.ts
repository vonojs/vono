import { EnvironmentContext, RequestContext } from "../../ctx";

async function createHandler(){
	// @ts-ignore - alias
	const {default: entry, $startup} = await import("#vono/entry") as {
		default: (request: Request) => Promise<Response>;
		$startup: () => Promise<void>;
	};

	return EnvironmentContext.run({}, async () => {
		await $startup();
		return (request: Request) => RequestContext.run(request, () => entry(request));
	})
}

const handler = EnvironmentContext.run({}, createHandler);

export default async (request: Request) => {
	const h = await handler;
	return h(request);
}

export const config = {
	path: "/*",
	preferStatic: true,
};

