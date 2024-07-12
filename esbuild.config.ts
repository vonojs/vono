import { defineConfig } from "@benstack/builder";
import { Plugin } from "esbuild";
import dtsPlugin from "esbuild-plugin-d.ts";

const bundleDepsOnly: () => Plugin = () => ({
	name: "bundle-deps-only",
	setup(build) {
		build.onResolve({ filter: /^\./ }, (args) => {
			return {
				external: true,
				path: args.path.replace(".ts", ".js"),
			};
		});
	},
});

export default defineConfig({
	entryPoints: ["src/**/*.*"],
	external: ["#vono"],
	bundle: true,
	outdir: "dist",
	platform: "node",
	format: "esm",
	target: "esnext",
	plugins: [dtsPlugin(), bundleDepsOnly()],
});
