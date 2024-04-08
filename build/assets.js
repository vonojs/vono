export async function getModuleManifest(path) {
	if (import.meta.env.DEV) {
		const res = await fetch(`http://localhost:5173/__fetch_asset?mod=${path}`);
		if (!res.ok) {
			throw new Error("Failed to fetch assets");
		}
		return await res.json();
	}
	const manifest = (await import("#vono/manifest")).default;
	return manifest[path];
}
