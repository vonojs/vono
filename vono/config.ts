export type Vono = {
	serverEntry: string,
}

export const createConfig = (config: Partial<Vono> = {}): Vono => {
	return {
		serverEntry: config.serverEntry || "src/server.entry",
	}
}