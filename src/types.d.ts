declare module '#vono/assets' {
	export const manifest: import("vite").Manifest;
	export const asset: (url: string) => import("vite").ManifestChunk;
	export const buildTags: (url: string) => string;
}

declare module '#vono/entry' {
	const entry: (req: Request) => Promise<Response>;
	export default entry;
}

declare module '#vono/request' {
	export const getRequest: () => Request | null;
}