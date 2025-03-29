import type {
	EnvironmentOptions,
	HmrContext,
	Manifest,
	Plugin,
	ResolvedConfig,
	RunnableDevEnvironment,
	ViteDevServer
} from "vite";
import * as fs from "fs/promises";
import * as path from "node:path";
import { createRequest, sendResponse } from "./node.ts";
import { type Adaptor } from "./adaptor.ts";
import { NodeAdaptor } from "./runtime/adaptors/node";
import { VirtualModules } from "./virtualModules.ts";
import { CloudflareAdaptor } from "./runtime/adaptors/cloudflare";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileExists, isClientEnvironment, isSsrEnvironment, isVonoEnvironment, logger } from "./util.ts";

type VonoConfig = {
	server?: string,
	preserveManifest?: boolean,
	adaptor?: Adaptor,
	preserveHtml?: boolean,
}

type VonoContext = {
	adaptor: Adaptor
	serverEntry: string,
	serverVirtualModules: VirtualModules,
	clientVirtualModules: VirtualModules,
	preserveManifest?: boolean,
	buildManifest?: string,
	htmlEntryPath?: string,
	preserveHtml?: boolean,
}

let makeVonoContext = (config: VonoConfig): VonoContext => {
	return {
		serverEntry: config.server ?? "server/index.ts",
		serverVirtualModules: new VirtualModules,
		clientVirtualModules: new VirtualModules,
		preserveManifest: config.preserveManifest,
		adaptor: config.adaptor ?? new NodeAdaptor,
		preserveHtml: config.preserveHtml ?? true,
	}
}

let makeVonoEnvironment = (c: VonoContext): EnvironmentOptions => {
	c.serverVirtualModules.set(
		"server",
		`import s from ${JSON.stringify(path.join(process.cwd(), c.serverEntry))}; export default s;`,
	)
	return {
		build: {
			rollupOptions: {
				input: {
					entry: c.adaptor.serverProdEntry,
				},
			},
			outDir: "dist-server",
			manifest: false,
		}
	}
}

let makeDevHtmlVirtualModule = async (
	htmlEntryPath: string | undefined,
	virtualModules: VirtualModules,
	server: ViteDevServer,
) => {
	virtualModules.set(
		"html",
		async () => {
			try {
				let html = await fs.readFile(
					htmlEntryPath!,
					"utf-8"
				)
				return `export default ${JSON.stringify(await server.transformIndexHtml("/", html))}`
			} catch {
				return `export default "";`
			}
		},
	)
}

let makeBuildHtmlVirtualModule = async (
	htmlEntryPath: string | undefined,
	virtualModules: VirtualModules,
	outDir: string,
) => {
	if(!htmlEntryPath) {
		virtualModules.set("html", `export default "";`)
		return;
	}

	try {
		virtualModules.set(
			"html",
			`export default ${JSON.stringify(
				await fs.readFile(
					path.join(
						process.cwd(),
						outDir,
						htmlEntryPath
					),
					"utf-8"
				)
			)}`
		)
	} catch {
		logger.warn(
			`${htmlEntryPath} was detected during dev but is not part of the build.`
		)
		virtualModules.set("html", `export default "";`)
	}
}

let invalidateHtmlVirtualModule = (ctx: HmrContext, htmlEntryPath?: string) => {
	if(!htmlEntryPath) return;

	if(htmlEntryPath && ctx.file.endsWith(htmlEntryPath)) {
		const mod = ctx.server.environments.vono.moduleGraph.getModuleById(
			"\0" + VirtualModules.ID + "html",
		);
		if (mod) {
			ctx.server.environments.vono.moduleGraph.invalidateModule(mod);
			ctx.server.ws.send({ type: 'full-reload' })
		}
	}
}

let resolveBuildManifest = async (
	outDir: string,
	preserveManifest: boolean = false
) => {
	try {
		let manifestPath = path.join(
			process.cwd(),
			outDir,
			".vite",
			"manifest.json"
		)

		let result = await fs.readFile(
			manifestPath,
			"utf-8"
		)

		if(!preserveManifest) {
			await fs.rm(
				manifestPath,
				{ recursive: true, force: true }
			)
		}

		return result;
	} catch {
		throw new Error(
			"Cannot find manifest.json."
		)
	}
}

let makeDevServerMiddleware = (
	serverDevEntry: string,
	server: ViteDevServer,
) => {
	server.middlewares.use(async (req, res, next) => {
		let handlerModule = await (<RunnableDevEnvironment>server.environments.vono)
			.runner.import(serverDevEntry);

		let handler = typeof handlerModule.default === "function"
			? handlerModule.default
			: handlerModule?.default?.fetch

		if(!(typeof handler === "function")) throw Error(
			`No handler function exported from ${serverDevEntry}`
		)

		let fetchRequest = createRequest(req, res)
		let response = await handler(fetchRequest, {});

		if(response instanceof Response) {
			await sendResponse(res, response)
		} else {
			next();
		}
	})
}

let serverBuildStartImpl = async (c: VonoContext, resolvedViteConfig: ResolvedConfig) => {
	// set up html virtual module for build
	await makeBuildHtmlVirtualModule(
		c.htmlEntryPath,
		c.serverVirtualModules,
		resolvedViteConfig.environments.client.build.outDir
	)

	// resolve and set the build manifest
	let manifestJson = await resolveBuildManifest(
		resolvedViteConfig.environments.client.build.outDir,
		c.preserveManifest
	)

	c.buildManifest = manifestJson

	c.serverVirtualModules.set(
		"manifest",
		`export default ${manifestJson}`
	)

	c.adaptor.serverBuildStart?.(
		c,
		resolvedViteConfig,
		JSON.parse(manifestJson)
	)
}

let serverBuildEndImpl = async (c: VonoContext, resolvedViteConfig: ResolvedConfig) => {
	if(!c.buildManifest) {
		throw new Error("Manifest not found")
	}

	if(!c.preserveHtml) {
		await fs.rm(
			path.join(
				resolvedViteConfig.environments.client.build.outDir,
				c.htmlEntryPath!
			),
			{ recursive: true, force: true }
		)
	}

	c.adaptor.serverBuildEnd?.(
		c,
		resolvedViteConfig,
		JSON.parse(c.buildManifest),
	)
}

let clientBuildStartImpl =  (
	c: VonoContext,
	resolvedViteConfig: ResolvedConfig
) =>  c.adaptor.clientBuildStart?.(c, resolvedViteConfig)

let clientBuildEndImpl = async (
	c: VonoContext,
	resolvedViteConfig: ResolvedConfig,
) => {
	await c.adaptor.clientBuildEnd?.(
		c,
		resolvedViteConfig,
	)
}

let configEnvImpl = (
	name: string,
	options: EnvironmentOptions,
) => {
	if(name === "client") {
		options.build ??= {};
		options.build.manifest = true;
	}
}

let setHtmlEntryPath = async (
	c: VonoContext,
	viteConfig: ResolvedConfig,
) => {
	let input = viteConfig.environments.client.build.rollupOptions.input

	// set the html path if it exists
	if(typeof input === "string" && input.endsWith(".html")) {
		c.htmlEntryPath = input
	} else if (await fileExists("index.html")) {
		c.htmlEntryPath = "index.html"
	}
}

let resolveDevManifest = (
	c: VonoContext,
	viteConfig: ResolvedConfig,
) => {
	let input = viteConfig.build.rollupOptions.input ?? {};
	let entries: Manifest = {};

	if (Array.isArray(input)) {
		entries = input.reduce((manifest, entry) => {
			manifest[entry] = {
				file: entry,
				isEntry: true,
				src: entry,
			};
			return manifest;}, {} as Manifest);
	} else if (typeof input === "object") {
		entries = Object.entries(input).reduce((manifest, [, entry]) => {
			manifest[entry] = {
				file: entry,
				isEntry: true,
				src: entry,
			};
			return manifest;}, {} as Manifest);
	} else if(typeof input === "string") {
		entries = {
			[<string>input]: {
				file: <string>input,
				isEntry: true,
				src: <string>input,
			},
		};
	}

	c.serverVirtualModules.set(
		"manifest",
		`export default ${JSON.stringify(entries)}`
	)
}

export default (config: VonoConfig = {}): Plugin | Plugin[] => {
	let c = makeVonoContext(config)

	// @ts-ignore
	globalThis.__vono__serverVirtualModules = c.serverVirtualModules
	// @ts-ignore
	globalThis.__vono__clientVirtualModules = c.clientVirtualModules

	let resolvedViteConfig: ResolvedConfig

	if(c.adaptor instanceof CloudflareAdaptor) {
		return [
			{
				name: "vono",
				enforce: "pre",
				async configResolved(viteConfig) {
					resolvedViteConfig = viteConfig
					await setHtmlEntryPath(c, viteConfig)
					resolveDevManifest(c, viteConfig)
				},
				configEnvironment(name, options) {
					configEnvImpl(name, options)
				},
				resolveId: {
					order: "pre",
					handler(id) {
						let result: any;

						if(
							isSsrEnvironment(this.environment)
							&& (result = c.serverVirtualModules.resolve(id))
						) {
							return result;
						}

						if(
							isClientEnvironment(this.environment)
							&& (result = c.clientVirtualModules.resolve(id))
						) {
							return result;
						}
					}
				},
				load: {
					order: "pre",
					async handler(id) {
						let result: any;

						if(
							isSsrEnvironment(this.environment)
							&& (result = await c.serverVirtualModules.load(id))
						) {
							return result;
						}

						if(
							isClientEnvironment(this.environment)
							&& (result = await c.clientVirtualModules.load(id))
						) {
							return result;
						}
					}
			},
				async configureServer(server) {
					await makeDevHtmlVirtualModule(
						c.htmlEntryPath,
						c.serverVirtualModules,
						server,
					)
				},
				async handleHotUpdate(ctx) {
					invalidateHtmlVirtualModule(ctx, c.htmlEntryPath)
				},
				async buildStart() {
					let callback = isSsrEnvironment(this.environment)
						? serverBuildStartImpl
						: clientBuildStartImpl
					await callback(c, resolvedViteConfig)
				},
				async buildEnd() {
					let callback = isSsrEnvironment(this.environment)
						? serverBuildEndImpl
						: clientBuildEndImpl
					await callback(c, resolvedViteConfig)
				}
			},
			...cloudflare({ ...c.adaptor.config, viteEnvironment: { name: "ssr" } }),
		]
	}

	return {
		name: "vono",
		config: {
			order: "post",
			handler(viteConfig) {
				viteConfig.environments ??= {}
				viteConfig.environments.vono = makeVonoEnvironment(c)
			}
		},
		configEnvironment(name, options) {
			configEnvImpl(name, options)
		},
		async configResolved(viteConfig) {
			resolvedViteConfig = viteConfig
			await setHtmlEntryPath(c, viteConfig)
			resolveDevManifest(c, viteConfig)
		},
		resolveId: {
			order: "pre",
			handler(id) {
				let result: any;

				if(
					isVonoEnvironment(this.environment)
					&& (result = c.serverVirtualModules.resolve(id))
				) {
					return result;
				}

				if(
					isClientEnvironment(this.environment)
					&& (result = c.clientVirtualModules.resolve(id))
				) {
					return result;
				}
			}
		},
		load: {
			order: "pre",
			async handler(id) {
				let result: any;

				if(
					isVonoEnvironment(this.environment)
					&& (result = await c.serverVirtualModules.load(id))
				) {
					return result;
				}

				if(
					isClientEnvironment(this.environment)
					&& (result = await c.clientVirtualModules.load(id))
				) {
					return result;
				}
			}
		},
		async handleHotUpdate(ctx) {
			invalidateHtmlVirtualModule(ctx, c.htmlEntryPath)
		},
		async configureServer(server) {

			await makeDevHtmlVirtualModule(
				c.htmlEntryPath,
				c.serverVirtualModules,
				server,
			);

			return () => makeDevServerMiddleware(
				c.adaptor.serverDevEntry,
				server
			)
		},
		async buildStart() {
			let callback = isVonoEnvironment(this.environment)
				? serverBuildStartImpl
				: clientBuildStartImpl
			await callback(c, resolvedViteConfig)
		},
		async buildEnd() {
			let callback = isVonoEnvironment(this.environment)
				? serverBuildEndImpl
				: clientBuildEndImpl
			await callback(c, resolvedViteConfig)
		}
	}
}

// @ts-ignore
export let getServerVirtualModules = () => globalThis.__vono__serverVirtualModules
// @ts-ignore
export let getClientVirtualModules = () => globalThis.__vono__clientVirtualModules
export { type Adaptor } from "./adaptor.ts";
export type { VonoContext, VonoConfig };