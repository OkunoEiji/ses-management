import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { countOrders, createOrder } from '$lib/server/repositories/orders';
import { listEngineers } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import { generateOrderNumber } from '$lib/utils/order-utils';
import type { Order } from '$lib/types';
import { today } from '$lib/utils';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = requireDb(platform);
	const engineers = await listEngineers(db);
	const projects = await listProjects(db);
	return {
		engineers,
		projects,
		prefillEngineerId: url.searchParams.get('engineer_id'),
		prefillProjectId: url.searchParams.get('project_id')
	};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Order, 'id'>;
		const now = today();
		const count = await countOrders(db);
		const order = await createOrder(db, {
			...data,
			order_number:
				data.order_number ?? generateOrderNumber(data.order_type ?? '注文書', count),
			created_at: now,
			updated_at: now
		});
		redirect(303, `/orders/${order.id}`);
	}
};
