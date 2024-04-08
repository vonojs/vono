import { ManifestChunk } from "vite";
export declare function getModuleManifest(
	path: string,
): Promise<ManifestChunk | undefined>;
