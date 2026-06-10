import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getEngineer, updateEngineer } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import type { Engineer } from '$lib/types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const engineer = await getEngineer(db, params.id);
	if (!engineer) error(404, '要員が見つかりません');
	const projects = await listProjects(db);
	return { engineer, projects };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Engineer, 'id'>;
		const engineer = await updateEngineer(db, params.id, data);
		if (!engineer) error(404, '要員が見つかりません');
		redirect(303, `/engineers/${params.id}`);
	}
};
