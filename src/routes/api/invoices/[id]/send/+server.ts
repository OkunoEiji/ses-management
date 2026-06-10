import type { RequestHandler } from './$types';
import { requireDb } from '$lib/server/db/platform';
import { addInvoiceSendLog, markInvoiceSent } from '$lib/server/repositories/invoices';
import { apiJson, apiError } from '$lib/server/api';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	const db = requireDb(platform);
	const body = (await request.json()) as {
		from_email: string;
		to_email: string;
		subject: string;
		body: string;
		attachment: { filename: string; content_base64: string };
	};

	if (!body.from_email?.trim() || !body.to_email?.trim() || !body.subject?.trim() || !body.body?.trim()) {
		apiError('必須項目が不足しています');
	}

	if (!body.attachment?.filename || !body.attachment?.content_base64) {
		apiError('請求書PDFの添付が必要です');
	}

	const log = await addInvoiceSendLog(db, {
		invoice_id: params.id,
		from_email: body.from_email.trim(),
		to_email: body.to_email.trim(),
		subject: body.subject.trim(),
		body: body.body.trim(),
		status: 'sent'
	});

	await markInvoiceSent(db, params.id);

	return apiJson({ log });
};
