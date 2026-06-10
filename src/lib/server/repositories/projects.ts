import { eq } from 'drizzle-orm';
import type { Project } from '$lib/types';
import type { getDb } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { toProject } from '$lib/server/db/mappers';

type Db = ReturnType<typeof getDb>;

export async function listProjects(db: Db): Promise<Project[]> {
	const rows = await db.select().from(projects);
	return rows.map(toProject);
}

export async function getProject(db: Db, id: string): Promise<Project | null> {
	const rows = await db.select().from(projects).where(eq(projects.id, id));
	return rows[0] ? toProject(rows[0]) : null;
}

export async function createProject(db: Db, data: Omit<Project, 'id'>): Promise<Project> {
	const id = crypto.randomUUID();
	await db.insert(projects).values({ id, ...data, status: data.status ?? '商談中' });
	return (await getProject(db, id))!;
}

export async function updateProject(db: Db, id: string, data: Omit<Project, 'id'>): Promise<Project | null> {
	const existing = await getProject(db, id);
	if (!existing) return null;
	await db.update(projects).set({ ...data, status: data.status ?? '商談中' }).where(eq(projects.id, id));
	return getProject(db, id);
}

export async function deleteProject(db: Db, id: string): Promise<boolean> {
	const existing = await getProject(db, id);
	if (!existing) return false;
	await db.delete(projects).where(eq(projects.id, id));
	return true;
}
