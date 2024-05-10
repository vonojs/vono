import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { createRequest, handleNodeResponse } from "../../tools/req-res";
import { join } from "node:path";
// @ts-ignore - alias
import buildctx from "#vono/buildctx";
// @ts-ignore - alias
import handler from "#vono/entry"

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

	const httpServer = createServer((req, res) => {
		assetHandler(req, res, () => {
			publicHandler(req, res, () => {
				handler(createRequest(req, res)).then((response: Response) =>
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

export const createMiddleware = async () => {
	return (req: IncomingMessage, res: ServerResponse) => handler(createRequest(req, res));
};

export const createWebMiddleware = async () => {
	return (request: Request) => handler(request);
};
