import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getEngineer } from '$lib/server/repositories/engineers';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const engineer = await getEngineer(db, params.id);
	if (!engineer) error(404, '要員が見つかりません');
	return { engineer };
};
