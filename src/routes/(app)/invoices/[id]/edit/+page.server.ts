import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getInvoice, updateInvoice } from '$lib/server/repositories/invoices';
import { listEngineers } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import { listOrders } from '$lib/server/repositories/orders';
import type { InvoiceInput } from '$lib/types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const invoice = await getInvoice(db, params.id);
	if (!invoice) error(404, '請求書が見つかりません');
	return {
		invoice,
		engineers: await listEngineers(db),
		projects: await listProjects(db),
		orders: await listOrders(db)
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as InvoiceInput;
		const invoice = await updateInvoice(db, params.id, data);
		if (!invoice) error(404, '請求書が見つかりません');
		redirect(303, `/invoices/${params.id}`);
	}
};
