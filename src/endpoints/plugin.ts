import { Plugin, ResolvedConfig } from 'vite';
import { useVFS } from "../vfs.ts";

export type EndpointConfig = {
	endpoint: string
}

const generateManifest = (config: ResolvedConfig) => ({})

export function endpoints(config: Partial<EndpointConfig> = {}): Plugin {
	const vfs = useVFS()
	let vite: ResolvedConfig | null = null
	let manifest = {}

	return {
		name: "endpoints",
		configResolved: (config) => {
			// need to generate manifest here
			vfs.add({
				path: '/endpoints/manifest',
				serverContent: () => `export default ${JSON.stringify(manifest)}`
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