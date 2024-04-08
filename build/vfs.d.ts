export declare class VFS {
	store: Map<string, VFile>;
	constructor(options?: {
		store?: Map<string, VFile>;
	});
	add<
		C extends ContentFn | undefined,
		SC extends ContentFn | undefined,
		CC extends ContentFn | undefined,
	>(vfile: {
		path: string;
		content?: C;
		serverContent?: SC;
		clientContent?: CC;
	}): {
		path: string;
		content: C;
		serverContent: SC;
		clientContent: CC;
	};
	remove(path: string): void;
	get(path: string): VFile | undefined;
	has(path: string): boolean;
}
type ContentFn = (params: Record<string, string[]>) => string | Promise<string>;
export type VFile = {
	path: string;
	content?: ContentFn;
	serverContent?: ContentFn;
	clientContent?: ContentFn;
	write?: boolean;
};
export declare function createVFile<
	C extends ContentFn | undefined,
	SC extends ContentFn | undefined,
	CC extends ContentFn | undefined,
>(vfile: {
	path: string;
	content?: C;
	serverContent?: SC;
	clientContent?: CC;
}): {
	path: string;
	content: C;
	serverContent: SC;
	clientContent: CC;
};
export declare const useVFS: () => VFS;
export {};
