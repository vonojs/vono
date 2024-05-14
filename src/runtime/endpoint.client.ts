export const endpoint = (key: string, name: string, path: string) => async (...args: any) => {
	try {
		const res = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key,
				name,
				args,
			}),
		});
		if (!res.ok) {
			return Error(res.statusText);
		}
		return res.json()
	} catch (e) {
		if(e instanceof Error) {
			return e
		}
		return Error('Unknown error');
	}
}