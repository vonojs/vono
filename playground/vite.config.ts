import { defineConfig } from "vite";
import { vono, CloudflareAdaptor } from "../src/mod";

export default defineConfig({
	plugins: [
		vono({
			server: "./server/index.ts",
			adaptor: new CloudflareAdaptor,
		}),
	],
})