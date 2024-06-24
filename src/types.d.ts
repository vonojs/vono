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