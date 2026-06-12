import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { isMockDataEnabled } from '$lib/config/mock-data';
import { requireDb } from '$lib/server/db/platform';
import { mockListOrders } from '$lib/server/mock';
import { deleteOrder, listOrders } from '$lib/server/repositories/orders';

export const load: PageServerLoad = async ({ platform }) => {
	if (isMockDataEnabled()) {
		return { orders: mockListOrders() };
	}

	const db = requireDb(platform);
	return { orders: await listOrders(db) };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		if (isMockDataEnabled()) {
			return fail(400, { error: 'モックデータモードでは削除できません' });
		}

		const db = requireDb(platform);
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'IDが必要です' });
		await deleteOrder(db, id);
		return { success: true };
	}
};
