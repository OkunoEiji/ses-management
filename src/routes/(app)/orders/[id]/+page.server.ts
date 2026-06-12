import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isMockDataEnabled } from '$lib/config/mock-data';
import { requireDb } from '$lib/server/db/platform';
import { mockGetOrder } from '$lib/server/mock';
import { getOrder } from '$lib/server/repositories/orders';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (isMockDataEnabled()) {
		const order = mockGetOrder(params.id);
		if (!order) error(404, '注文書が見つかりません');
		return { order };
	}

	const db = requireDb(platform);
	const order = await getOrder(db, params.id);
	if (!order) error(404, '注文書が見つかりません');
	return { order };
};
