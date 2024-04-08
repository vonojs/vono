/***********************************************************
 *
 *  This module has been adapted from Remix's Vite plugin.
 *  https://remix.run
 *
 ***********************************************************/
/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from "node:http";
export declare function createRequest(req: IncomingMessage, res: ServerResponse): Request;
export declare function handleNodeResponse(webRes: Response, res: ServerResponse): Promise<void>;
