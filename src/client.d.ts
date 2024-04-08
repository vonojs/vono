declare module "#vono/shell" {
	const content: string;
	// @ts-ignore
	export default content;
}

declare module "#vono/manifest" {
	const manifest: import("vite").Manifest;
	// @ts-ignore
	export default manifest;
}
