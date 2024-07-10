import { defineConfig } from "@benstack/builder";
import dtsPlugin from "esbuild-plugin-d.ts";

export default defineConfig({
	// entryPoints: ["src/mod.ts", "src/adaptors/**/*.ts", "src/runtime.ts"],
	entryPoints: ["src/**/*.*"],
	external: ["#vono", "vite"],
	bundle: true,
	outdir: "dist",
	platform: "node",
	format: "esm",
	target: "esnext",
	plugins: [dtsPlugin()],
});
