import { getModuleManifest } from "#vono/assets";

export const getEntry = () => getModuleManifest("/src/entry.client.tsx")