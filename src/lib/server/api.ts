import { error, json } from '@sveltejs/kit';
import type { NumericRange } from '@sveltejs/kit';

export function apiError(message: string, status: NumericRange<400, 599> = 400) {
	return error(status, message);
}

export function apiJson<T>(data: T, status = 200) {
	return json(data, { status });
}
