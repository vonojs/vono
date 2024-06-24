import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono, { CloudflareAdaptor } from "../src/mod";

export default defineConfig({
	
	plugins: [
		react(),
		vono({
			serverEntry: "src/server.entry.ts",
			adaptor: new CloudflareAdaptor(),
		}),
	]
});
