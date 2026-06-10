export type InvoiceEmailAttachment = {
	filename: string;
	content_base64: string;
};

export type InvoiceSendLog = {
	id: string;
	invoice_id: string;
	from_email: string;
	to_email: string;
	subject: string;
	body: string;
	attachment_filename: string;
	status: 'sent' | 'failed';
	sent_at: string;
	error_message?: string | null;
};

export type InvoiceSendLogInput = Omit<InvoiceSendLog, 'id' | 'sent_at'> & {
	attachment: InvoiceEmailAttachment;
};

const sendLogs: InvoiceSendLog[] = [];

export function getInvoiceSendLogs(invoiceId: string): InvoiceSendLog[] {
	return sendLogs
		.filter((log) => log.invoice_id === invoiceId)
		.sort((a, b) => b.sent_at.localeCompare(a.sent_at));
}

export function addInvoiceSendLog(input: InvoiceSendLogInput): InvoiceSendLog {
	const log: InvoiceSendLog = {
		invoice_id: input.invoice_id,
		from_email: input.from_email,
		to_email: input.to_email,
		subject: input.subject,
		body: input.body,
		attachment_filename: input.attachment.filename,
		status: input.status,
		error_message: input.error_message,
		id: crypto.randomUUID(),
		sent_at: new Date().toISOString()
	};
	sendLogs.unshift(log);
	return log;
}

/** メール送付をシミュレート（将来 API に差し替え・attachment を Resend 等へ渡す） */
export async function sendInvoiceEmail(input: InvoiceSendLogInput): Promise<InvoiceSendLog> {
	if (!input.attachment?.filename || !input.attachment.content_base64) {
		throw new Error('請求書PDFの添付が必要です');
	}

	await new Promise((resolve) => setTimeout(resolve, 600));
	return addInvoiceSendLog({ ...input, status: 'sent' });
}
