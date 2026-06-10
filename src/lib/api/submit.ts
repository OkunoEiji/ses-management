import { deserialize } from '$app/forms';
import { goto } from '$app/navigation';

const JSON_FIELD = '__json__';

function actionErrorMessage(result: { data?: { error?: unknown }; error?: { message?: string } }) {
	if (result.data?.error != null) return String(result.data.error);
	if (result.error?.message) return result.error.message;
	return '保存に失敗しました';
}

export async function submitJsonAction(data: unknown, action = '?') {
	const form = new FormData();
	form.set(JSON_FIELD, JSON.stringify(data));

	const response = await fetch(action, {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'x-sveltekit-action': 'true'
		},
		body: form
	});
	const result = deserialize(await response.text());
	if (result.type === 'redirect') {
		await goto(result.location);
	} else if (result.type === 'failure' || result.type === 'error') {
		throw new Error(actionErrorMessage(result));
	}
	return result;
}

export async function submitDeleteAction(id: string) {
	const form = new FormData();
	form.set('id', id);
	const response = await fetch('?/delete', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'x-sveltekit-action': 'true'
		},
		body: form
	});
	return deserialize(await response.text());
}
