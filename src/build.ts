import * as vite from "vite";
import { PLUGIN_NAME } from "./constants";
import { InternalConfig } from "./config";
import * as fs from "fs/promises";
import * as pathe from "pathe";
import { httpPlugin } from "./http";

export function buildPlugin(config: InternalConfig): vite.Plugin {
	config.vfs.add({
		path: "/internal/server.entry",
		content: () =>
			"import app from '/Users/benten/dev/vpb/playground/server.entry'; export default app;",
	});

	return {
		name: `${PLUGIN_NAME}:builder:client`,
		config() {
			return {
				build: {
					outDir: config.adaptor.publicDir,
					manifest: "manifest.json",
				},
			};
		},
		writeBundle: {
			sequential: true,
			handler: async () => {
				//@ts-expect-error
				if (globalThis.__building_server) return;
				//@ts-expect-error
				globalThis.__building_server = true;
				await vite.build({
					plugins: [
						httpPlugin(),
						{
							name: `${PLUGIN_NAME}:builder:ssr`,
							config: () => ({
								build: {
									outDir: config.adaptor.serverDir,
									manifest: "manifest.json",
								},
							}),
						},
					],
					appType: "custom",
					ssr: {
						noExternal: true,
					},
					build: {
						ssr: true,
						emptyOutDir: false,
						rollupOptions: {
							output: {
								chunkFileNames: "[name].[hash].[format].js",
								inlineDynamicImports: config.adaptor.inlineDynamicImports,
							},
							input: {
								index: config.adaptor.runtime,
							},
							external: config.adaptor.env?.external,
						},
					},
				});
				fs.copyFile(
					pathe.join(config.adaptor.publicDir, "manifest.json"),
					pathe.join(config.adaptor.serverDir, "manifest.client.json")
				);
				pathe.join(config.adaptor.publicDir, "manifest.json");
				config.adaptor.onBuild && (await config.adaptor.onBuild());
			},
		},
	};
}
