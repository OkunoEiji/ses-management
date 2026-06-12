import type { LayoutServerLoad } from './$types';
import { isMockDataEnabled } from '$lib/config/mock-data';
import { requireDb } from '$lib/server/db/platform';
import { mockGetCompanySettings } from '$lib/server/mock';
import { getCompanySettings } from '$lib/server/repositories/company-settings';

export const load: LayoutServerLoad = async ({ platform }) => {
	if (isMockDataEnabled()) {
		return {
			companySettings: mockGetCompanySettings(),
			useMockData: true
		};
	}

	const db = requireDb(platform);
	const companySettings = await getCompanySettings(db);
	return { companySettings, useMockData: false };
};
