// @ts-ignore - alias
import { RequestContext, EnvironmentContext } from "../../ctx";

let hasStarted = false;
export default {
	fetch: async (request: Request, env: any) => {
		if(request.method === "GET"){
			const a = await (env.ASSETS as any).fetch(request);
			if(a.ok) return a;
			if(a.status === 304){
				return new Response(null, {
					status: 304,
					statusText: "Not Modified",
				});
			}
		}

		// @ts-ignore - alias
		const {default: handler, $startup} = await import("#vono/entry");

		await EnvironmentContext.run({ env }, async () => {
			if(!hasStarted){
				hasStarted = true;
				return $startup?.();
			}
		});

		return await EnvironmentContext.run({ env }, async () => {
			return RequestContext.run(request, async () => handler(request))
		});
	}
}

