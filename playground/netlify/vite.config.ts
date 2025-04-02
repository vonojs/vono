import { defineConfig } from "vite";
import { vono, NetlifyAdaptor } from "../../src/mod";

export default defineConfig({
	plugins: [
		vono({
			server: "./server/index.ts",
			adaptor: NetlifyAdaptor,
			preserveHtml: false,
		}),
	],
})