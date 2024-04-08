import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { EnvironmentContext, RequestContext } from "../../ctx";
import { createRequest, handleNodeResponse } from "../../tools/req-res";
import { join } from "node:path";
// @ts-ignore - alias
import buildctx from "#vono/buildctx";

async function createHandler() {
	// @ts-ignore - alias
	const { default: entry, $startup } = (await import("#vono/entry")) as {
		default: (request: Request) => Promise<Response>;
		$startup: () => Promise<void>;
	};

	return EnvironmentContext.run({}, async () => {
		await $startup();
		return (request: Request) =>
			RequestContext.run(request, () => entry(request));
	});
}

const handler = EnvironmentContext.run({}, createHandler);

async function main() {
	const sirv = (await import("sirv")).default;

	const assetHandler = sirv(join(buildctx.clientOutputDirectory, "assets"), {
		immutable: true,
		maxAge: 31536000,
		dev: false,
	});

	const publicHandler = sirv(buildctx.clientOutputDirectory, {
		immutable: true,
		maxAge: 0,
		dev: false,
	});

	const _handler = await handler;

	const httpServer = createServer((req, res) => {
		assetHandler(req, res, () => {
			publicHandler(req, res, () => {
				_handler(createRequest(req, res)).then((response) =>
					handleNodeResponse(response, res),
				);
			});
		});
	});

	const port = process.argv[2] ?? 8000;
	httpServer.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

if (
	[process.argv[1], process.argv[1] + ".js"].some(
		(s) => s === fileURLToPath(import.meta.url),
	)
) {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}

export const middleware = async (req: IncomingMessage, res: ServerResponse) => {
	return handler.then((h) => h(createRequest(req, res)));
};

export const webMiddleware = async (request: Request) => {
	return handler.then((h) => h(request));
};
