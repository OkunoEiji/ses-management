import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getProject } from '$lib/server/repositories/projects';
import { listEngineersByProjectId } from '$lib/server/repositories/engineers';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const project = await getProject(db, params.id);
	if (!project) error(404, '案件が見つかりません');
	const engineers = await listEngineersByProjectId(db, params.id);
	return { project, engineers };
};
