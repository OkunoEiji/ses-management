import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { deleteOrder, listOrders } from '$lib/server/repositories/orders';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	return { orders: await listOrders(db) };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const db = requireDb(platform);
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'IDが必要です' });
		await deleteOrder(db, id);
		return { success: true };
	}
};
