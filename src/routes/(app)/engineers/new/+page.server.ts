import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db/platform';
import { createEngineer } from '$lib/server/repositories/engineers';
import { listProjects } from '$lib/server/repositories/projects';
import type { Engineer } from '$lib/types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = requireDb(platform);
	return { projects: await listProjects(db) };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = requireDb(platform);
		const data = (await request.json()) as Omit<Engineer, 'id'>;
		await createEngineer(db, data);
		redirect(303, '/engineers');
	}
};
