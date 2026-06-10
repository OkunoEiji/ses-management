const JSON_FIELD = '__json__';

export async function readActionJson<T>(request: Request): Promise<T> {
	const contentType = request.headers.get('content-type') ?? '';

	if (contentType.includes('application/json')) {
		return (await request.json()) as T;
	}

	const form = await request.formData();
	const raw = form.get(JSON_FIELD);
	if (typeof raw !== 'string') {
		throw new Error('Invalid form submission');
	}

	return JSON.parse(raw) as T;
}
