import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono, { CloudflareAdaptor, rpc } from "../src/mod";

export default defineConfig({
	plugins: [react(), vono({
		adaptor: new CloudflareAdaptor()
	}), rpc()],
	build: {
		assetsInlineLimit: 0,
	}
});
