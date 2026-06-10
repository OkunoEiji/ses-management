import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { countInvoices, createInvoice } from '$lib/server/repositories/invoices';
import { listEngineers } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import { listOrders } from '$lib/server/repositories/orders';
import { generateInvoiceNumber } from '$lib/utils/invoice-utils';
import type { InvoiceInput } from '$lib/types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = requireDb(platform);
	return {
		engineers: await listEngineers(db),
		projects: await listProjects(db),
		orders: await listOrders(db),
		prefillEngineerId: url.searchParams.get('engineer_id'),
		prefillProjectId: url.searchParams.get('project_id')
	};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as InvoiceInput;
		const count = await countInvoices(db);
		const invoice = await createInvoice(db, {
			...data,
			invoice_number: data.invoice_number ?? generateInvoiceNumber(count)
		});
		redirect(303, `/invoices/${invoice.id}`);
	}
};
