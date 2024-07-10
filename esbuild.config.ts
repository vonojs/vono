import { defineConfig } from "@benstack/builder";
import dtsPlugin from "esbuild-plugin-d.ts";

export default defineConfig({
	entryPoints: ["src/**/*.*"],
	external: ["#vono", "./src/*"],
	bundle: true,
	outdir: "dist",
	platform: "node",
	format: "esm",
	target: "esnext",
	plugins: [dtsPlugin()],
});
