import { RequestContext, EnvironmentContext } from "../../ctx.js";
const mod = await EnvironmentContext.run({ env: "dev" }, async () => {
	const handler = (await import("#vono/entry")).default;
	return (r) => RequestContext.run(r, async () => handler(r));
});
export default mod;
