import * as vite from "vite"
import { useVFS } from "./mod"

export type EndpointConfig = {
	endpoint: string
}

type EndpointManifest = Record<string, () => Promise<Function>>

function endpoints(config: Partial<EndpointConfig> = {}): vite.Plugin {
	const vfs = useVFS()
	let vite: vite.ResolvedConfig | null = null
	let manifest = {}

	const generateManifest = (config: vite.ResolvedConfig) => {
		const root = config.root
		const result: EndpointManifest = {}
		// want to recursivly walk root looking for files that end in .endpoints.ts or .endpoints.js

		return result;
	}

	return {
		name: "endpoints",
		configResolved: (config) => {
			// need to generate manifest here
			vfs.add({
				path: '/endpoints/manifest',
				serverContent: () => `export default {}`
			})
		},
		transform(code, id, c) {
			if(c?.ssr) {
				return code
			}
			// transform to client runtime code
		},
		handleHotUpdate: (ctx) => {
			// handle updating manifest here...
		}
	}
}
