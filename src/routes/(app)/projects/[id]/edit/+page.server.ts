import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { getProject, updateProject } from '$lib/server/repositories/projects';
import type { Project } from '$lib/types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = requireDb(platform);
	const project = await getProject(db, params.id);
	if (!project) error(404, '案件が見つかりません');
	return { project };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Project, 'id'>;
		const project = await updateProject(db, params.id, data);
		if (!project) error(404, '案件が見つかりません');
		redirect(303, `/projects/${params.id}`);
	}
};
