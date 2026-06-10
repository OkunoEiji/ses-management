import type { LayoutServerLoad } from './$types';
import { requireDb } from '$lib/server/db/platform';
import { getCompanySettings } from '$lib/server/repositories/company-settings';

export const load: LayoutServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	const companySettings = await getCompanySettings(db);
	return { companySettings };
};
