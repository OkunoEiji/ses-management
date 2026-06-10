import type { Actions, PageServerLoad } from './$types';
import { requireDb } from '$lib/server/db/platform';
import { getCompanySettings, updateCompanySettings } from '$lib/server/repositories/company-settings';
import type { CompanySettings } from '$lib/types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	return { companySettings: await getCompanySettings(db) };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as CompanySettings;
		const companySettings = await updateCompanySettings(db, data);
		return { companySettings };
	}
};
