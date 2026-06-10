import { desc, eq } from 'drizzle-orm';
import type { Invoice, InvoiceInput, InvoiceSendLog, InvoiceStatus } from '$lib/types';
import { applyStatusTimestamps } from '$lib/utils/invoice-utils';
import { today } from '$lib/utils';
import type { getDb } from '$lib/server/db';
import { invoiceSendLogs, invoices } from '$lib/server/db/schema';
import { invoiceToDb, toInvoice } from '$lib/server/db/mappers';

type Db = ReturnType<typeof getDb>;

export async function listInvoices(db: Db): Promise<Invoice[]> {
	const rows = await db.select().from(invoices);
	return rows.map(toInvoice);
}

export async function getInvoice(db: Db, id: string): Promise<Invoice | null> {
	const rows = await db.select().from(invoices).where(eq(invoices.id, id));
	return rows[0] ? toInvoice(rows[0]) : null;
}

export async function countInvoices(db: Db): Promise<number> {
	const rows = await db.select().from(invoices);
	return rows.length;
}

export async function createInvoice(db: Db, data: InvoiceInput): Promise<Invoice> {
	const id = crypto.randomUUID();
	const now = today();
	const timestamps = applyStatusTimestamps(data, null, now);
	const row = {
		id,
		...invoiceToDb({
			...data,
			created_at: now,
			...timestamps
		})
	};
	await db.insert(invoices).values(row);
	return (await getInvoice(db, id))!;
}

export async function updateInvoice(db: Db, id: string, data: InvoiceInput): Promise<Invoice | null> {
	const existing = await getInvoice(db, id);
	if (!existing) return null;
	const timestamps = applyStatusTimestamps(data, existing);
	const row = invoiceToDb({
		...data,
		created_at: existing.created_at ?? timestamps.updated_at,
		...timestamps
	});
	await db.update(invoices).set(row).where(eq(invoices.id, id));
	return getInvoice(db, id);
}

export async function markInvoiceSent(db: Db, id: string): Promise<Invoice | null> {
	const existing = await getInvoice(db, id);
	if (!existing) return null;
	const now = today();
	const timestamps = applyStatusTimestamps({ status: '送付済み' }, existing, now);
	await db
		.update(invoices)
		.set({
			sent_at: timestamps.sent_at,
			status: existing.status === '下書き' || !existing.status ? '送付済み' : existing.status,
			updated_at: timestamps.updated_at
		})
		.where(eq(invoices.id, id));
	return getInvoice(db, id);
}

export async function markInvoicePaid(db: Db, id: string): Promise<Invoice | null> {
	const existing = await getInvoice(db, id);
	if (!existing) return null;
	const now = today();
	const timestamps = applyStatusTimestamps({ status: '入金済み' }, existing, now);
	await db
		.update(invoices)
		.set({
			status: '入金済み',
			sent_at: timestamps.sent_at,
			paid_at: timestamps.paid_at,
			updated_at: timestamps.updated_at
		})
		.where(eq(invoices.id, id));
	return getInvoice(db, id);
}

export async function deleteInvoice(db: Db, id: string): Promise<boolean> {
	const existing = await getInvoice(db, id);
	if (!existing) return false;
	await db.delete(invoices).where(eq(invoices.id, id));
	return true;
}

export type InvoiceSendInput = {
	invoice_id: string;
	from_email: string;
	to_email: string;
	subject: string;
	body: string;
	status: 'sent' | 'failed';
	error_message?: string | null;
};

export async function addInvoiceSendLog(db: Db, input: InvoiceSendInput): Promise<InvoiceSendLog> {
	const id = crypto.randomUUID();
	const sent_at = new Date().toISOString();
	await db.insert(invoiceSendLogs).values({
		id,
		invoice_id: input.invoice_id,
		from_email: input.from_email,
		to_email: input.to_email,
		subject: input.subject,
		body: input.body,
		status: input.status,
		error_message: input.error_message ?? null,
		sent_at
	});
	return { id, ...input, sent_at };
}

export async function listInvoiceSendLogs(db: Db, invoiceId: string): Promise<InvoiceSendLog[]> {
	const rows = await db
		.select()
		.from(invoiceSendLogs)
		.where(eq(invoiceSendLogs.invoice_id, invoiceId))
		.orderBy(desc(invoiceSendLogs.sent_at));
	return rows.map((r) => ({
		id: r.id,
		invoice_id: r.invoice_id,
		from_email: r.from_email,
		to_email: r.to_email,
		subject: r.subject,
		body: r.body,
		status: r.status as InvoiceSendLog['status'],
		sent_at: r.sent_at,
		error_message: r.error_message
	}));
}
