export abstract class Adaptor {
	abstract name: string;
	// RUNTIME ---------------------------------------------------------------------
	abstract productionRuntime: string;
	abstract developmentRuntime: string;
	// OUTPUT ----------------------------------------------------------------
	outputDirectory = "dist";
	assetDirectory = "client"
	inlineDynamicImports = false;
	// ENV ---------------------------------------------------------------------
	alias: {[p: string]: string} = {}
	inject: {[p: string]: string | string[]} = {}
	polyfill: string[] = []
	external: string[] = []
	resolve: {conditions?: string[] | undefined, externalConditions?: string[] | undefined} = {}
	// ACTIONS ----------------------------------------------------------------
	buildStart?: () => void | Promise<void>;
	buildEnd?: () => void | Promise<void>;
	buildError?: (err: Error) => void | Promise<void>;
	prerender?: () => void | Promise<void>;
}