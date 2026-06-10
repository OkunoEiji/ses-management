import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { createProject } from '$lib/server/repositories/projects';
import type { Project } from '$lib/types';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Project, 'id'>;
		const project = await createProject(db, data);
		redirect(303, `/projects/${project.id}`);
	}
};
