export declare abstract class Adaptor {
    abstract name: string;
    abstract productionRuntime: string;
    abstract developmentRuntime: string;
    outputDirectory: string;
    inlineDynamicImports: boolean;
    alias: {
        [p: string]: string;
    };
    inject: {
        [p: string]: string | string[];
    };
    polyfill: string[];
    external: string[];
    resolve: {
        conditions?: string[] | undefined;
        externalConditions?: string[] | undefined;
    };
    buildStart?: () => void | Promise<void>;
    buildEnd?: () => void | Promise<void>;
    buildError?: (err: Error) => void | Promise<void>;
    prerender?: () => void | Promise<void>;
}
