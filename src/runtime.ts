import { Manifest, ManifestChunk } from "vite";

export async function asset(path: string): Promise<ManifestChunk | undefined> {
	// @ts-expect-error - virtual
	const assetFn = await import("#vono/assets").then((m) => m.asset);
	return assetFn(path);
}

export async function manifest(): Promise<Manifest> {
	// @ts-expect-error - virtual
	return import("#vono/assets").then((m) => m.manifest);
}

export async function buildTags(scripts: string[]){
	const result: string[] = [];
	const mods: ManifestChunk[] = [];
	for (const script of scripts) {
		const mod = await asset(script)
		mod && mods.push(mod);
	}
	for(const mod of mods){
		if(mod.file){
			result.push(`<script type="module" src="/${mod.file}"></script>`)
		}
		for(const css of mod.css ?? []){
			result.push(`<link rel="stylesheet" href="/${css}">`)
		}
		if(mod.imports){
			result.push(await buildTags(mod.imports))
		}
	}
	return result.join("\n");
}
