import * as esbuild from "esbuild"
import * as fs from "fs/promises"

let args = process.argv.slice(2)

let replaceTsExt = (path: string) =>
	path.endsWith(".ts") ? path.replace(".ts", "") + ".js" : path

export let build = async (args: { defines: Record<string, any>, drop: string[] }) => {
	await esbuild.build({
		entryPoints: ["src/**/*.ts"],
		bundle: true,
		outdir: ".dist",
		format: "esm",
		platform: "node",
		define: args.defines,
		dropLabels: args.drop,
		treeShaking: true,
		target: ["es2022"],
		plugins: [{
			name: 'resolve-ext',
			setup(build) {
				build.onResolve({ filter: /.*/ }, args => {
					if(
						args.path === "sirv"
						|| args.importer.includes("sirv")
						|| args.path.includes("elysiatech")
						|| args.importer.includes("elysiatech")
					) {
						return;
					}
					if (args.importer){
						return {
							path: replaceTsExt(args.path),
							external: true
						}
					} else {
						return { path: args.path, external: true }
					}
				})
			},
		}],
	})
}

fs.rm(".dist", { recursive: true, force: true })

let mode = args.includes("--prod") ? "production" : "development"

console.info(`Building in ${mode} mode...`)

let t = performance.now()

if(mode === "production") {
	await build({
		defines: {},
		drop: [],
	})
} else {
	await build({
		defines: {},
		drop: [],
	})
}

fs.copyFile("src/server.d.ts", ".dist/server.d.ts")
fs.rm(".dist/server.d.js", { force: true })
fs.copyFile("src/client.d.ts", ".dist/client.d.ts")
fs.rm(".dist/client.d.js", { force: true })

console.info(`Built in ${(performance.now() - t).toFixed(0)}ms`)