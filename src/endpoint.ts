import * as vite from "vite"
import { useVFS } from "./mod"
import * as fs from "node:fs/promises"
import * as p from "node:path"
// @ts-ignore
import { init, parse } from 'es-module-lexer';

const isEndpointPath = (path: string) => path.endsWith(".endpoints.ts") || path.endsWith(".endpoints.tsx")

const clientRuntime = `
export default function endpoint(key, name, path) {
	return async (...args) => {
		try {
			const res = await fetch(path, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({key, name, args}),
			});
			if (!res.ok) {
				return Error(res.statusText);
			}
			return await res.json()
		} catch (e) {
			if (e instanceof Error) {
				return e
			}
			return Error('Unknown error');
		}
	}
}
`
const serverRuntime = `
import manifest from "#vono/endpoints/manifest";

export default function endpoint(handler, config) {
	handler.isEndpoint = true;
	handler.config = config;
	return handler;
}

export const middleware = (path = "/__endpoints") => async (request) => {
	if(!new URL(request.url).pathname.startsWith(path)){
		return null;
	}

	const body = await request.json();
	if(!body.key) {
		console.warn("No key provided in request body.")
		return null;
	}

	const endpointFile = await manifest[body.key]();
	if(!endpointFile) {
		console.warn("No endpoint file found for key in request body:", body.key);
		return null;
	}

	const endpoint = endpointFile[body.name];
	if(!endpoint || !endpoint.isEndpoint) {
		console.warn("No endpoint found for name in request body:", body.name);
		return null;
	}

	const result = await endpoint(...body.args);
	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
`

export function endpoints(): vite.Plugin {
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
				serverContent: () => serverRuntime,
				clientContent: () => clientRuntime,
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
						result += `export default endpoint("${file![0]}", "default", "/__endpoints");\n`
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
				ctx.server.reloadModule(
					await ctx.server.moduleGraph.getModuleById("\0" + "virtual:vfs:/endpoints")!
				)
				ctx.server.reloadModule(
					await ctx.server.moduleGraph.getModuleById("\0" + "virtual:vfs:/endpoints/manifest")!
				)
			}
		}
	}
}
