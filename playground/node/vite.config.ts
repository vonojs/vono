import { defineConfig } from "vite";
import { vono } from "../../src/mod";

export default defineConfig({
	plugins: [
		vono({
			server: "./server/index.ts",
			preserveHtml: false,
		}),
	],
})