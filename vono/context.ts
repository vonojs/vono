import {AsyncLocalStorage} from "node:async_hooks";

export const REQUEST_CONTEXT = "__vono_request_context__";
declare global {
	var __vono_request_context__: AsyncLocalStorage<Request> | undefined;
}
export function getRequest(){
	return globalThis[REQUEST_CONTEXT]?.getStore();
}

export const ENVIRONMENT_CONTEXT = "__vono_environment_context__";
declare global {
	var __vono_environment_context__: AsyncLocalStorage<any> | undefined;
}
export function getEnvironment(){
	return globalThis[ENVIRONMENT_CONTEXT]?.getStore();
}
