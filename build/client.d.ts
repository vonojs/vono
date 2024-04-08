declare module "#vono/shell" {
	const content: string;
	export default content;
}

declare module "#vono/manifest" {
	const manifest: import("vite").Manifest;
	export default manifest;
}
