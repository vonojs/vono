/// <reference types="node" />
import { AsyncLocalStorage } from "node:async_hooks";
export declare const RequestContext: AsyncLocalStorage<Request>;
export declare const EnvironmentContext: AsyncLocalStorage<unknown>;
