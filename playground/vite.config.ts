import { defineConfig } from "vite";
import vono from "../dist/mod";
import { CloudflareAdaptor } from "../dist/adaptors/cloudflare";
import { NetlifyAdaptor } from "../dist/adaptors/netlify";

export default defineConfig({
	plugins: [
		vono({
			serverEntry: "src/server.entry.ts",
			clientEntry: "src/client.entry.tsx",
			adaptor: new NetlifyAdaptor(),
		}),
	],
});
