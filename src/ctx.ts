import { AsyncLocalStorage } from "node:async_hooks";
export const RequestContext = new AsyncLocalStorage<Request>();
export const EnvironmentContext = new AsyncLocalStorage<unknown>();
