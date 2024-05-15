declare module "#vono/shell" {
	const content: string;
	export default content;
}

declare module "#vono/manifest" {
	const manifest: import("vite").Manifest;
	export default manifest;
}

declare module "#vono/assets" {
	export const getModuleInfo: (
		path: string,
	) => Promise<import("vite").ManifestChunk | undefined>;
}

declare module "#vono/request" {
	export function getRequest(): Request | null;
}

declare module "#vono/endpoints" {
	export default function endpoint<
		Args extends Serializable,
		T extends ((...args: Args[]) => Serializable | Promise<Serializable>) & { isEndpoint?: boolean, config?: EndpointConfig }
	>(handler: T, config?: EndpointConfig): (...args: Args[]) => ReturnType<T>;
}