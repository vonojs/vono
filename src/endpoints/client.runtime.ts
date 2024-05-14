export const endpoint_client_runtime = (name: string, path: string) => async (...args: any) => {
	try {
		const res = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				args,
			}),
		});
		if (!res.ok) {
			return Error(res.statusText);
		}

	} catch (e) {
		if(e instanceof Error) {
			return e
		}
		return Error('Unknown error');
	}
}