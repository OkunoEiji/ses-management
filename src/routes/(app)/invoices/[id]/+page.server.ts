import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isMockDataEnabled } from '$lib/config/mock-data';
import { requireDb } from '$lib/server/db/platform';
import {
	mockGetCompanySettings,
	mockGetEngineer,
	mockGetInvoice,
	mockGetProject
} from '$lib/server/mock';
import { getInvoice } from '$lib/server/repositories/invoices';
import { getProject } from '$lib/server/repositories/projects';
import { getEngineer } from '$lib/server/repositories/engineers';
import { buildInvoiceLookup, toInvoicePreview } from '$lib/utils/invoice-utils';
import { getCompanySettings } from '$lib/server/repositories/company-settings';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (isMockDataEnabled()) {
		const invoice = mockGetInvoice(params.id);
		if (!invoice) error(404, '請求書が見つかりません');

		const companySettings = mockGetCompanySettings();
		const engineer = invoice.engineer_id ? mockGetEngineer(invoice.engineer_id) : null;
		const project = invoice.project_id ? mockGetProject(invoice.project_id) : null;
		const lookup = buildInvoiceLookup(
			engineer ? [{ id: engineer.id, name: engineer.name }] : [],
			project ? [{ id: project.id, name: project.name }] : []
		);

		return {
			invoice,
			project,
			preview: toInvoicePreview(invoice, companySettings, lookup)
		};
	}

	const db = requireDb(platform);
	const invoice = await getInvoice(db, params.id);
	if (!invoice) error(404, '請求書が見つかりません');

	const companySettings = await getCompanySettings(db);
	const engineer = invoice.engineer_id ? await getEngineer(db, invoice.engineer_id) : null;
	const project = invoice.project_id ? await getProject(db, invoice.project_id) : null;
	const lookup = buildInvoiceLookup(
		engineer ? [{ id: engineer.id, name: engineer.name }] : [],
		project ? [{ id: project.id, name: project.name }] : []
	);

	return {
		invoice,
		project,
		preview: toInvoicePreview(invoice, companySettings, lookup)
	};
};
