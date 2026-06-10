import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { readActionJson } from '$lib/server/action-body';
import { requireDb } from '$lib/server/db/platform';
import { createProject } from '$lib/server/repositories/projects';
import type { Project } from '$lib/types';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = await readActionJson<Omit<Project, 'id'>>(request);
		const project = await createProject(db, data);
		redirect(303, `/projects/${project.id}`);
	}
};
