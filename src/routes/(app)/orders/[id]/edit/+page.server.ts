import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getOrder, updateOrder } from '$lib/server/repositories/orders';
import { listEngineers } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import type { Order } from '$lib/types';
import { today } from '$lib/utils';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const order = await getOrder(db, params.id);
	if (!order) error(404, '注文書が見つかりません');
	const engineers = await listEngineers(db);
	const projects = await listProjects(db);
	return { order, engineers, projects };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Order, 'id'>;
		const existing = await getOrder(db, params.id);
		if (!existing) error(404, '注文書が見つかりません');
		await updateOrder(db, params.id, {
			...data,
			created_at: existing.created_at ?? today(),
			updated_at: today()
		});
		redirect(303, `/orders/${params.id}`);
	}
};
