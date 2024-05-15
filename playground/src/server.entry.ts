import shell from "#vono/shell";
import { getModuleInfo } from "#vono/assets"

export default async function handler(req: Request): Promise<Response> {
	console.log(await getModuleInfo('/src/client.entry.tsx'))
	return new Response(shell.replace("%vono:ssr%", String(req?.url)), {
		headers: {
			"content-type": "text/html",
		},
	});
}
