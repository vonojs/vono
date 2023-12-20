import { Context } from "hono";
export function defineHandler(
	handler: (context: Context) => Response | object | string
) {
	return handler;
}
