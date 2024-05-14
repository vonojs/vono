// @ts-ignore
import manifest from "#actions/manifest";

type EndpointConfig = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

type Serializable = string | number | boolean | null | undefined | Serializable[] | { [key: string]: Serializable };

export function endpoint<
	Args extends Serializable,
	T extends (context: Request, ...args: Args[]) => Serializable | Promise<Serializable>
>(endpoint: T, config?: EndpointConfig) {
	const handler = async (...args: Args[]) => {
		const request = globalThis.getRequest_unsafe?.() as Request | null;
		if(!request) {
			throw new Error('Request context not available. This is a bug.');
		}
		return endpoint(request, ...args);
	}
	handler.isEndpoint = true;
	handler.config = config;
	return handler as unknown as  (...args: Args[]) => ReturnType<T>;
}

export async function middleware (request: Request): Promise<Response | null> {
	const body = await request.json();
	if(!body.name) {
		return null;
	}

	const action = manifest[body.name];
	if(!action) {
		return null;
	}
	if(!action.isAction) {
		return null;
	}

	const args = body.args;
	const result = await action.endpoint(request, ...args);
	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}