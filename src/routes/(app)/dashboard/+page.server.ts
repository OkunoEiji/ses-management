import type { PageServerLoad } from './$types';
import { requireDb } from '$lib/server/db/platform';
import { listEngineers } from '$lib/server/repositories/engineers';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	return { engineers: await listEngineers(db) };
};
