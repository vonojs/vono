import * as vite from "vite"
import { useVFS } from "./mod"
import * as fs from "node:fs/promises"
import * as p from "node:path"
import { init, parse } from 'es-module-lexer';
import { runtimeDir } from "./runtime"

export type EndpointConfig = {
	endpoint: string
}

type EndpointManifest = Record<string, {
	path: string,
	endpoint: string
}>

const isEndpointPath = (path: string) => path.endsWith(".endpoints.ts") || path.endsWith(".endpoints.tsx")

export function endpoints(config: Partial<EndpointConfig> = {}): vite.Plugin {
	const vfs = useVFS()
	let vite: vite.ResolvedConfig | null = null
	let manifest: Record<string, string>

	const generateManifest = async (config: vite.ResolvedConfig) => {
		const result: Record<string, string> = {}
		const files = await fs.readdir(p.join(config.root, "src"), { recursive: true, withFileTypes: true });
		for(const file of files){
			if(file.isFile() && isEndpointPath(file.name)) {
				result[String(Math.random()).substring(2)] = p.join(file.path, file.name);
			}
		}
		return result;
	}

	return {
		name: "endpoints",
		configResolved: async (config) => {
			vite = config
			manifest = await generateManifest(config);
			vfs.add({
				path: "endpoints/manifest",
				serverContent: () => `export default {${Object.entries(manifest).map(([k, v]) => `"${k}": () => import("${v}")`).join(",")}}`
			});
			vfs.add({
				path: "endpoints",
				serverContent: () => `import { endpoint, middleware } from '${p.join(runtimeDir, 'endpoint.server.ts')}'; export default endpoint; export middleware;`,
				clientContent: () => `import { endpoint } from '${p.join(runtimeDir, 'endpoint.client.ts')}'; export default endpoint;`,
			})
		},
		transform: async (code, id, c) =>{
			if(c?.ssr) {
				return code
			}
			if(isEndpointPath(id)) {
				const file = Object.entries(manifest).find(([, v]) => v === id)
				if(!file) throw new Error("File not found in manifest")

				await init;

				const [, exports] = parse(code);

				let result = 'import endpoint from "#vono/endpoints";\n'

				for(const exp of exports) {
					if(exp.n === "default") {
						result += 'export default endpoint("${file![0]}", "default", "/__endpoints");\n'
					} else {
						result += `export const ${exp.n} = endpoint("${file![0]}", "${exp.n}", "/__endpoints");\n`
					}
				}

				return {
					code: result,
					map: null
				}
			}
		},
		handleHotUpdate: async (ctx) => {
			if(isEndpointPath(ctx.file)) {
				manifest = await generateManifest(vite!)
			}
		}
	}
}
