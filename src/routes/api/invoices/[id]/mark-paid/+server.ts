import type { RequestHandler } from './$types';
import { requireDb } from '$lib/server/db/platform';
import { markInvoicePaid } from '$lib/server/repositories/invoices';
import { apiJson, apiError } from '$lib/server/api';

export const POST: RequestHandler = async ({ params, platform }) => {
	const db = requireDb(platform);
	const invoice = await markInvoicePaid(db, params.id);
	if (!invoice) apiError('請求書が見つかりません', 404);
	return apiJson({ invoice });
};
