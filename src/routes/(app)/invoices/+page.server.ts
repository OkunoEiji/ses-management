import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { deleteInvoice, listInvoices } from '$lib/server/repositories/invoices';
import { listEngineers } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import { buildInvoiceLookup } from '$lib/utils/invoice-utils';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	const invoices = await listInvoices(db);
	const engineers = await listEngineers(db);
	const projects = await listProjects(db);
	return {
		invoices,
		lookup: buildInvoiceLookup(engineers, projects)
	};
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const db = requireDb(platform);
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'IDが必要です' });
		await deleteInvoice(db, id);
		return { success: true };
	}
};
