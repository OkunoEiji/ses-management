import type { Actions, PageServerLoad } from './$types';
import { isMockDataEnabled } from '$lib/config/mock-data';
import { mockGetCompanySettings } from '$lib/server/mock';
import { readActionJson } from '$lib/server/action-body';
import { requireDb } from '$lib/server/db/platform';
import { getCompanySettings, updateCompanySettings } from '$lib/server/repositories/company-settings';
import type { CompanySettings } from '$lib/types';

export const load: PageServerLoad = async ({ platform }) => {
	if (isMockDataEnabled()) {
		return { companySettings: mockGetCompanySettings() };
	}

	const db = requireDb(platform);
	return { companySettings: await getCompanySettings(db) };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (isMockDataEnabled()) {
			return { companySettings: mockGetCompanySettings() };
		}

		const db = requireDb(platform);
		const data = await readActionJson<CompanySettings>(request);
		const companySettings = await updateCompanySettings(db, data);
		return { companySettings };
	}
};
