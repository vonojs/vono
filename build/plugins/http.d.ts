import { Plugin } from "vite";
export type ResolveIdFallback = (specifier: string, importer?: string) => string | void;
export declare function httpPlugin(): Plugin;
