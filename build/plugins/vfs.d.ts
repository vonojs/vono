import * as vite from "vite";
import { VFS } from "../vfs";
export default function vfsPlugin(options?: {
    vfs?: VFS;
    alias?: string;
}): vite.Plugin;
