import { defineConfig } from "vite";
import { vono, CloudflareAdaptor, NetlifyAdaptor } from "../src/mod";

export default defineConfig({
	plugins: [
		vono({
			server: "./server/index.ts",
			// adaptor: new CloudflareAdaptor,
			adaptor: NetlifyAdaptor,
			preserveHtml: false,
		}),
	],
})