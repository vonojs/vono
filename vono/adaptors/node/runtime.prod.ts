import { IncomingMessage, ServerResponse} from "node:http"
import {createRequest, handleNodeResponse} from "../../tools/req-res";
import {fileURLToPath} from "node:url";
import {EnvironmentContext, RequestContext} from "../../ctx";

async function main(){
	const entry = await EnvironmentContext.run({env: "prod"}, async () => {
		return (await import("#vono/entry")).default as (r: Request) => Response | Promise<Response>;
	})
	const handler = async (req: IncomingMessage, res: ServerResponse) => {
		const request = createRequest(req, res)
		RequestContext.run(request, async () => {
			return handleNodeResponse(await entry(createRequest(req, res)), res)
		})
	}
	if ([process.argv[1], process.argv[1] + ".js"].some(s => s === fileURLToPath(import.meta.url))) {
		import("node:http").then(({createServer}) => {
			createServer(handler).listen(3000)
		})
	}
	return handler
}

let middleware: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
export default async (req: IncomingMessage, res: ServerResponse) => {
	if(!middleware) {
		middleware = await main()
	}
	return middleware(req, res)
}

main().catch(console.error)
