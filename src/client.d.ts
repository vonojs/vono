declare module "#vono/shell" {
	const content: string;
	export default content;
}

declare module "#vono/manifest" {
	const manifest: import("vite").Manifest;
	export default manifest;
}

declare module "#vono/assets" {
	export const getModuleManifest: (
		path: string,
	) => Promise<import("vite").ManifestChunk | undefined>;
}

declare module "#vono/request" {
	export function getRequest(): Request | null;
}
