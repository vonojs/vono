// @ts-ignore - alias
import {RequestContext, EnvironmentContext} from "../../ctx";

const mod = await EnvironmentContext.run({env: "dev"}, async () => {
	const handler = (await import("#vono/entry")).default as (r: Request) => Response | Promise<Response>;
	return (r: Request) => RequestContext.run(r, async () => handler(r));
})

export default mod;