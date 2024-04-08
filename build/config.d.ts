import { Adaptor } from "./adaptor";
export type Vono = {
	serverEntry: string;
	adaptor: Adaptor;
	includeIndexHtml?: boolean;
};
export declare const createConfig: (config?: Partial<Vono>) => Vono;
