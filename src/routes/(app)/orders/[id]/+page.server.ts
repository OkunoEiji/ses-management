import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getOrder } from '$lib/server/repositories/orders';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const order = await getOrder(db, params.id);
	if (!order) error(404, '注文書が見つかりません');
	return { order };
};
