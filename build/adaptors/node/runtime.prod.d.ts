/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "node:http";
export declare const webMiddleware: (request: Request) => Promise<Response>;
export declare const nodeMiddleware: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
