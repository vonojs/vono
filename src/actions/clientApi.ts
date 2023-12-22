export const createClientApi = <T>(handlerUrl: string) => {
  const createProxy = <T>(path: string[] = []): T => {
    return new Proxy(() => {}, {
      get: (_, key: string) => {
        return createProxy([...path, key]);
      },
      apply: async (_, __, args) => {
        const res = await fetch(`${handlerUrl}`, {
          method: "POST",
          body: JSON.stringify({
            path,
            args,
          }),
        })
        if (res.status === 200) {
          return res.json();
        }
        throw new Error("Error");
      },
    }) as T;
  };
  return createProxy<T>();
}