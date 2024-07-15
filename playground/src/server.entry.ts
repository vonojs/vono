import { buildTags } from "#vono/assets";
import { name } from "./shell";

const shell = async () => `
<!DOCTYPE html>
<html>
	<head>
		<title>Playground</title>
		${await buildTags(["src/client.entry.tsx"])}
	</head>
	<body>
		<h1>Hello, ${name}!</h1>
	</body>
</html>
`;

export default async function handler(req: Request): Promise<Response> {
	const s = await shell();
	await buildTags(["src/client.entry.tsx"]);
	return new Response(s, {
		headers: { "content-type": "text/html" },
	});
}
