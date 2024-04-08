import { AsyncLocalStorage } from "node:async_hooks";
export const RequestContext = new AsyncLocalStorage();
export const EnvironmentContext = new AsyncLocalStorage();
