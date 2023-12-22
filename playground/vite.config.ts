import { defineConfig } from "vite";
import backend from "../src/index";
import cloudflare from "../src/adaptors/cloudflare"
import netlify from "../src/adaptors/netlify"
import deno from "../src/adaptors/deno"

export default defineConfig({
	plugins: [backend({ 
		debug: true, 
		adaptor: cloudflare()
	})],
	server: {
		port: 8000,
	}
});
