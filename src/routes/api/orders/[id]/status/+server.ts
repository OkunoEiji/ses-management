import type { RequestHandler } from './$types';
import type { OrderStatus } from '$lib/types';
import { requireDb } from '$lib/server/db/platform';
import { updateOrderStatus } from '$lib/server/repositories/orders';
import { apiJson, apiError } from '$lib/server/api';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	const db = requireDb(platform);
	const body = (await request.json()) as { status: OrderStatus };
	const status = body.status;

	if (!['送付済み', '承認済み'].includes(status)) {
		apiError('無効なステータスです');
	}

	const order = await updateOrderStatus(db, params.id, status);
	if (!order) apiError('注文書が見つかりません', 404);
	return apiJson({ order });
};
