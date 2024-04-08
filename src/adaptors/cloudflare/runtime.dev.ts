import { RequestContext, EnvironmentContext } from "../../ctx";
// @ts-ignore - alias
const {default: handler, $startup} = await import("#vono/entry");

const mod = await (async () => {
	if($startup) await EnvironmentContext.run({env: "dev"}, () => $startup?.());
	return (r: Request) =>
		EnvironmentContext.run({env: "dev"}, () =>
			RequestContext.run(r, async () => handler(r)))
})()

export default mod;
