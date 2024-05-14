import { resolveModuleDirectory } from "../tools"

export const runtimeDir = resolveModuleDirectory(import.meta.url);