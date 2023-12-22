function recursiveGet(obj: Record<string, any>, path: string[]) {
  const key = path.shift();
  if (!key) {
    return obj;
  }
  const value = obj[key];
  if (typeof value === "object" && value !== null) {
    return recursiveGet(value, path);
  }
  return value;
}

export const createServerApi = <T>(manifest: Record<string, any>) => {
	const createProxy = <T>(path: string[] = []): T => {
		return new Proxy(() => {}, {
			get: (_, key: string) => {
				return createProxy([...path, key]);
			},
			apply: async (_, __, args) => {
        const actionName = path.pop()
        if (!actionName) {
          throw new Error("Action name not found");
        }
				const handlerPath = recursiveGet(manifest, path);
        if (!handlerPath) {
          throw new Error("Handler not found");
        }
        const handler = await import(handlerPath);
        const action = handler[actionName];
        if (!action) {
          throw new Error("Action not found");
        }
        return action(...args);
			},
		}) as T;
	};
	return createProxy<T>();
};