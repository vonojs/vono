import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono from "../src/mod";
import Cloudflare from "../src/adaptors/cloudflare";
import Netlify from "../src/adaptors/netlify";

export default defineConfig({
	plugins: [vono({ includeIndexHtml: false}), react()],
	build: {
		assetsInlineLimit: 0,
	},
});
