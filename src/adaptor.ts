import type { VonoContext } from "./mod.ts";
import type { Manifest, ResolvedConfig } from "vite";

export interface Adaptor {
	name: string
	serverDevEntry: string
	serverProdEntry: string

	clientBuildStart?(
		context: VonoContext,
		viteConfig: ResolvedConfig,
	): void | Promise<void>

	clientBuildEnd?(
		context: VonoContext,
		viteConfig: ResolvedConfig,
	): void | Promise<void>

	serverBuildStart?(
		context: VonoContext,
		viteConfig: ResolvedConfig,
		manifest: Manifest
	): void | Promise<void>

	serverBuildEnd?(
		context: VonoContext,
		viteConfig: ResolvedConfig,
		manifest: Manifest
	): void | Promise<void>
}