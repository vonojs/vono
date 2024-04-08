export class VitePlugin {
	vite;
	config;
	init;
	handleHotUpdate;
	register() {
		return {
			name: this.name,
			config: this.config,
			configResolved: (vite) => {
				this.vite = vite;
				if (this.init) this.init(vite);
			},
			handleHotUpdate: this.handleHotUpdate,
		};
	}
}
