import { defineConfig } from "vite";
import vono from "../src/mod";

export default defineConfig({
	plugins: [
		vono({
			serverEntry: "src/server.entry.ts",
			clientEntry: "src/client.entry.tsx",
		}),
	],
});
