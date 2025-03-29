export class VirtualModules {
	static ID = "#vono/"

	get = (id: string) =>
		this._map.get(id)

	set = (id: string, code: string | (() => string | Promise<string>)) =>
		this._map.set(id, code)

	resolve = (id: string) => {
		if (id.startsWith(VirtualModules.ID)) {
			return "\0" + id;
		}
	}

	load = async (id: string) => {
		if(id.startsWith("\0" + VirtualModules.ID)) {
			let path = id.replace("\0" + VirtualModules.ID, "");
			const file = this.get(path);
			if (file) {
				if (typeof file === "string") {
					return file;
				} else {
					return file();
				}
			}
		}
	}

	_map = new Map<string, string | (() => string | Promise<string>)>()
}