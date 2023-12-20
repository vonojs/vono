import { defineConfig } from "vite";
import backend from "../src/index";

export default defineConfig({
	plugins: [backend({ debug: true })],
	server: {
		port: 8000,
	},
	build: {
		rollupOptions: {
			
		}
	}
});
