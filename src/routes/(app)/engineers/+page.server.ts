import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { deleteEngineer, listEngineers } from '$lib/server/repositories/engineers';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	return { engineers: await listEngineers(db) };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const db = requireDb(platform);
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'IDが必要です' });
		await deleteEngineer(db, id);
		return { success: true };
	}
};
