import { eq } from 'drizzle-orm';
import type { Order, OrderStatus } from '$lib/types';
import type { getDb } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { orderToDb, toOrder } from '$lib/server/db/mappers';

type Db = ReturnType<typeof getDb>;

export async function listOrders(db: Db): Promise<Order[]> {
	const rows = await db.select().from(orders);
	return rows.map(toOrder);
}

export async function getOrder(db: Db, id: string): Promise<Order | null> {
	const rows = await db.select().from(orders).where(eq(orders.id, id));
	return rows[0] ? toOrder(rows[0]) : null;
}

export async function countOrders(db: Db): Promise<number> {
	const rows = await db.select().from(orders);
	return rows.length;
}

export async function createOrder(db: Db, data: Omit<Order, 'id'>): Promise<Order> {
	const id = crypto.randomUUID();
	await db.insert(orders).values({ id, ...orderToDb(data) });
	return (await getOrder(db, id))!;
}

export async function updateOrder(db: Db, id: string, data: Omit<Order, 'id'>): Promise<Order | null> {
	const existing = await getOrder(db, id);
	if (!existing) return null;
	await db.update(orders).set(orderToDb(data)).where(eq(orders.id, id));
	return getOrder(db, id);
}

export async function updateOrderStatus(db: Db, id: string, status: OrderStatus): Promise<Order | null> {
	const existing = await getOrder(db, id);
	if (!existing) return null;
	await db.update(orders).set({ status, updated_at: new Date().toISOString() }).where(eq(orders.id, id));
	return getOrder(db, id);
}

export async function deleteOrder(db: Db, id: string): Promise<boolean> {
	const existing = await getOrder(db, id);
	if (!existing) return false;
	await db.delete(orders).where(eq(orders.id, id));
	return true;
}
