export class VFS {
	store = /* @__PURE__ */ new Map();
	constructor(options = {}) {
		if (options.store) this.store = options.store;
	}
	add(vfile) {
		let path = vfile.path.startsWith("/") ? vfile.path : "/" + vfile.path;
		vfile.path = path;
		this.store.set(path, vfile);
		return vfile;
	}
	remove(path) {
		!path.startsWith("/") && (path = "/" + path);
		this.store.delete(path);
	}
	get(path) {
		!path.startsWith("/") && (path = "/" + path);
		return this.store.get(path);
	}
	has(path) {
		!path.startsWith("/") && (path = "/" + path);
		return this.store.has(path);
	}
}
export function createVFile(vfile) {
	return vfile;
}
const vfs = new VFS();
export const useVFS = () => vfs;
