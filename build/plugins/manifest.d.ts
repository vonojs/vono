import { ModuleNode, Plugin } from "vite";
interface ManifestChunk {
	src?: string;
	file: string;
	css?: string[];
	assets?: string[];
	isEntry?: boolean;
	name?: string;
	isDynamicEntry?: boolean;
	imports?: string[];
	dynamicImports?: string[];
}
export declare function moduleNodeToManifestChunk(
	node: ModuleNode,
): ManifestChunk;
export default function manifest(config: {
	manifest: string | (() => string);
}): Plugin;
export {};
