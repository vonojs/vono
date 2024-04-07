import {IncomingMessage, ServerResponse, createServer} from "node:http"
import {fileURLToPath} from "node:url";
import {EnvironmentContext, RequestContext} from "../../ctx";
import {createRequest, handleNodeResponse} from "../../tools/req-res";
// @ts-ignore - alias
import buildctx from "#vono/buildctx"
import {join} from "node:path";

async function main() {
	const entry = await EnvironmentContext.run({env: "prod"}, async () => {
		// @ts-ignore - alias
		return (await import("#vono/entry")).default as (r: Request) => Response | Promise<Response>;
	})

	const handler = async (request: Request) => RequestContext.run(
		request,
		async () => entry(request))

	if ([process.argv[1], process.argv[1] + ".js"].some(s => s === fileURLToPath(import.meta.url))) {

		const sirv = (await import('sirv')).default

		const assetHandler = sirv(join(buildctx.clientOutputDirectory, "assets"), {
			immutable: true,
			maxAge: 31536000,
			dev: false,
		})

		const publicHandler = sirv(buildctx.clientOutputDirectory, {
			immutable: true,
			maxAge: 0,
			dev: false,
		})

		const httpServer = createServer((req, res) => {
			assetHandler(req, res, () => {
				publicHandler(req, res, () => {
					handler(createRequest(req, res)).then(response => handleNodeResponse(response, res))
				})
			})
		})
		httpServer.listen(3000)
	}
	return handler
}

main().catch(console.error)

let middleware: (request: Request) => Promise<Response>
export const webMiddleware = async (request: Request) => {
	if (!middleware) {
		middleware = await main()
	}
	return middleware(request)
}
export const nodeMiddleware = async (req: IncomingMessage, res: ServerResponse) => {
	const request = createRequest(req, res)
	const response = await webMiddleware(request)
	return handleNodeResponse(response, res)
}
