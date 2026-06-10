import { eq } from 'drizzle-orm';
import type { Engineer } from '$lib/types';
import type { getDb } from '$lib/server/db';
import { engineers, projects } from '$lib/server/db/schema';
import { engineerToDb, toEngineer } from '$lib/server/db/mappers';

type Db = ReturnType<typeof getDb>;

async function projectNameMap(db: Db): Promise<Map<string, string>> {
	const rows = await db.select({ id: projects.id, name: projects.name }).from(projects);
	return new Map(rows.map((r) => [r.id, r.name]));
}

export async function listEngineers(db: Db): Promise<Engineer[]> {
	const nameMap = await projectNameMap(db);
	const rows = await db.select().from(engineers);
	return rows.map((r) => toEngineer(r, r.project_id ? nameMap.get(r.project_id) : undefined));
}

export async function getEngineer(db: Db, id: string): Promise<Engineer | null> {
	const rows = await db.select().from(engineers).where(eq(engineers.id, id));
	if (!rows[0]) return null;
	let projectName: string | undefined;
	if (rows[0].project_id) {
		const proj = await db.select().from(projects).where(eq(projects.id, rows[0].project_id));
		projectName = proj[0]?.name;
	}
	return toEngineer(rows[0], projectName);
}

export async function listEngineersByProjectId(db: Db, projectId: string): Promise<Engineer[]> {
	const rows = await db.select().from(engineers).where(eq(engineers.project_id, projectId));
	const proj = await db.select().from(projects).where(eq(projects.id, projectId));
	const projectName = proj[0]?.name;
	return rows.map((r) => toEngineer(r, projectName));
}

export async function createEngineer(db: Db, data: Omit<Engineer, 'id'>): Promise<Engineer> {
	const id = crypto.randomUUID();
	await db.insert(engineers).values({ id, ...engineerToDb(data) });
	return (await getEngineer(db, id))!;
}

export async function updateEngineer(
	db: Db,
	id: string,
	data: Omit<Engineer, 'id'>
): Promise<Engineer | null> {
	const existing = await getEngineer(db, id);
	if (!existing) return null;
	await db.update(engineers).set(engineerToDb(data)).where(eq(engineers.id, id));
	return getEngineer(db, id);
}

export async function deleteEngineer(db: Db, id: string): Promise<boolean> {
	const existing = await getEngineer(db, id);
	if (!existing) return false;
	await db.delete(engineers).where(eq(engineers.id, id));
	return true;
}
