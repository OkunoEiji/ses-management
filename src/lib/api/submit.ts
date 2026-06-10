import { deserialize } from '$app/forms';
import { goto } from '$app/navigation';

function toJsonBody(data: unknown): string {
	if (data !== null && typeof data === 'object') {
		return JSON.stringify({ ...(data as Record<string, unknown>) });
	}
	return JSON.stringify(data);
}

export async function submitJsonAction(data: unknown, action = '?/default') {
	const response = await fetch(action, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
			'x-sveltekit-action': 'true'
		},
		body: toJsonBody(data)
	});
	const result = deserialize(await response.text());
	if (result.type === 'redirect') {
		await goto(result.location);
	} else if (result.type === 'failure' || result.type === 'error') {
		throw new Error(String(result.data?.error ?? '保存に失敗しました'));
	}
	return result;
}

export async function submitDeleteAction(id: string) {
	const form = new FormData();
	form.set('id', id);
	const response = await fetch('?/delete', { method: 'POST', body: form });
	return deserialize(await response.text());
}
