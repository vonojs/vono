import type { UserConfig, ResolvedConfig, HmrContext, Plugin } from "vite";

export abstract class VitePlugin {
	abstract name: string;

	vite!: ResolvedConfig;

	config?: (vite: UserConfig) => UserConfig;
	init?: (vite: ResolvedConfig) => void;
	handleHotUpdate?: (ctx: HmrContext) => void;

	register() {
		return {
			name: this.name,
			config: this.config,
			configResolved: (vite: ResolvedConfig) => {
				this.vite = vite;
				if (this.init) this.init(vite);
			},
			handleHotUpdate: this.handleHotUpdate,
		} satisfies Plugin;
	}
}
