import { ActionManifest } from ".";

export async function handleRequest(
	manifest: ActionManifest,
	request: Request
) {
	try {
		if (request.method !== "POST") {
			return null;
		}
		const body = await request.json();
    if(!body.path) return null;
		const action = await getActionFromPath(manifest, body.path);
		const res = await action(...body.args ?? []);
		return new Response(JSON.stringify(res), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		})
	} catch {
    return null;
  }
}

export async function getActionFromPath(
	manifest: ActionManifest,
	path: string
) {
	try {
		if (!path) return null;
		const parts = path.split(".");
		const actionName = parts.pop();
		const file = await import(manifest[parts.join(".")]);
		if (!actionName || !(actionName in file)) {
			return null;
		}
		return file[actionName];
	} catch {
		return null;
	}
}