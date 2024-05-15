declare module "#vono/shell" {
	const content: string;
	export default content;
}

declare module "#vono/assets" {
	export const manifest: import("vite").Manifest;
	export function getModuleInfo(
		path: string,
	): Promise<import("vite").ManifestChunk | undefined>;
}

declare module "#vono/request" {
	export function getRequest(): Request | null;
}

declare module "#vono/rpc" {
	export default function rpc<
		Args extends Serializable,
		T extends ((...args: Args[]) => Serializable | Promise<Serializable>) & { isEndpoint?: boolean, config?: EndpointConfig }
	>(handler: T, config?: EndpointConfig): (...args: Args[]) => ReturnType<T | Error>;
	export function middleware(req: Request): Promise<Response>
}