import shell from "#vono/shell";

export default async function handler(req: Request): Promise<Response> {
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
