import type { CompanySettings, Invoice, InvoiceStatus } from '$lib/types';
import { calcRates } from '$lib/utils/order-utils';
import { today } from '$lib/utils';

export type { CompanySettings };

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
	id: 'default',
	company_name: '株式会社ネクストメイク',
	postal_code: '550-0011',
	address: '大阪府大阪市西区阿波座2丁目2-18',
	building: 'NANKAI西本町ビル 7F',
	registration_number: 'T1120101057629',
	bank_name: '三井住友銀行',
	bank_branch: '和泉支店',
	bank_branch_code: '177',
	bank_account_type: '普通預金',
	bank_account_name: 'ｶﾌﾞｼｷｶｲｼｬﾈｸｽﾄﾒｲｸ',
	bank_account_number: '1969203',
	sender_email_primary: 'billing@nextmake.co.jp',
	sender_email_secondary: 'info@nextmake.co.jp'
};

export type InvoiceLookup = {
	engineerNames?: Map<string, string>;
	projectNames?: Map<string, string>;
};

export type InvoiceEmailDefaults = {
	fromEmail: string;
	toEmail: string;
	subject: string;
	body: string;
};

export type InvoiceCalculations = {
	deduction_hours: number;
	deduction_amount: number;
	overtime_hours: number;
	overtime_amount: number;
	amount: number;
	tax_rate: number;
	tax_amount: number;
	travel_expenses: number;
	total_amount: number;
};

export type InvoiceDisplay = Invoice & InvoiceCalculations & {
	engineer_name: string;
	project_name: string | null;
};

export type InvoicePreviewData = InvoiceDisplay & {
	company: CompanySettings;
};

export const INVOICE_TABLE_ROW_COUNT = 15;
export const INVOICE_PREVIEW_PAGE_WIDTH_PX = 794;
export const INVOICE_PREVIEW_PAGE_HEIGHT_PX = 1123;
export const INVOICE_PREVIEW_PANEL_WIDTH_PX = INVOICE_PREVIEW_PAGE_WIDTH_PX + 34;

export function buildInvoiceEmailDefaults(
	preview: InvoicePreviewData,
	options?: {
		clientContactName?: string | null;
		clientContactEmail?: string | null;
	}
): InvoiceEmailDefaults {
	const contactName = options?.clientContactName?.trim();
	const addressee = contactName ? `${preview.client_name} ${contactName}` : preview.client_name;
	const dueDate = resolveDueDate(preview);

	const subject = `【請求書】${preview.client_name}様 ${preview.billing_month}分`;

	const body = `${addressee} 様

お世話になっております。
${preview.company.company_name}です。

${preview.billing_month}分の請求書をお送りいたします。
ご確認のほど、よろしくお願いいたします。

請求金額：¥${preview.total_amount.toLocaleString()}（税込）
支払期限：${dueDate}

よろしくお願いいたします。`;

	return {
		fromEmail: preview.company.sender_email_primary,
		toEmail: options?.clientContactEmail?.trim() ?? '',
		subject,
		body
	};
}

export function billingMonthLabel(billingMonth: string): string {
	const [y, m] = billingMonth.split('-');
	if (!y || !m) return billingMonth;
	return `${y}年${Number(m)}月度`;
}

export function calcDueDateFromBillingMonth(billingMonth: string): string {
	const [yStr, mStr] = billingMonth.split('-');
	const y = Number(yStr);
	const m = Number(mStr);
	if (!y || !m) return '';

	let payYear = y;
	let payMonth = m + 2;
	if (payMonth > 12) {
		payMonth -= 12;
		payYear += 1;
	}
	return `${payYear}-${String(payMonth).padStart(2, '0')}-15`;
}

export function resolveDueDate(invoice: Pick<Invoice, 'due_date' | 'billing_month'>): string {
	if (invoice.due_date?.trim()) return invoice.due_date.trim();
	return calcDueDateFromBillingMonth(invoice.billing_month);
}

export function resolveEngineerName(
	invoice: Pick<Invoice, 'engineer_id'>,
	lookup?: InvoiceLookup
): string {
	if (!invoice.engineer_id) return '';
	return lookup?.engineerNames?.get(invoice.engineer_id) ?? '';
}

export function resolveProjectName(
	invoice: Pick<Invoice, 'project_id'>,
	lookup?: InvoiceLookup
): string | null {
	if (!invoice.project_id) return null;
	return lookup?.projectNames?.get(invoice.project_id) ?? null;
}

export function resolveDeductionOvertimeRates(
	invoice: Pick<Invoice, 'deduction_rate' | 'overtime_rate' | 'unit_price' | 'standard_hours_min' | 'standard_hours_max'>
) {
	const stdMin = invoice.standard_hours_min ?? 140;
	const stdMax = invoice.standard_hours_max ?? 180;
	const unitPrice = invoice.unit_price ?? 0;

	if (invoice.deduction_rate != null && invoice.overtime_rate != null) {
		return { deduction_rate: invoice.deduction_rate, overtime_rate: invoice.overtime_rate };
	}

	const { deduction, overtime } = calcRates(unitPrice, stdMin, stdMax);
	return {
		deduction_rate: invoice.deduction_rate ?? deduction,
		overtime_rate: invoice.overtime_rate ?? overtime
	};
}

export function calcInvoiceTotals(params: {
	unit_price: number;
	actual_hours?: number;
	standard_hours_min?: number;
	standard_hours_max?: number;
	deduction_rate?: number;
	overtime_rate?: number;
	travel_expenses?: number;
	tax_rate?: number;
}): InvoiceCalculations {
	const stdMin = params.standard_hours_min ?? 140;
	const stdMax = params.standard_hours_max ?? 180;
	const actual = params.actual_hours ?? 0;
	const dedRate = params.deduction_rate ?? 0;
	const ovRate = params.overtime_rate ?? 0;
	const travel = params.travel_expenses ?? 0;

	let deduction_hours = 0;
	let deduction_amount = 0;
	if (actual > 0 && actual < stdMin) {
		deduction_hours = stdMin - actual;
		deduction_amount = Math.round(deduction_hours * dedRate);
	}

	let overtime_hours = 0;
	let overtime_amount = 0;
	if (actual > stdMax) {
		overtime_hours = actual - stdMax;
		overtime_amount = Math.round(overtime_hours * ovRate);
	}

	const baseAmount = params.unit_price * 10_000;
	const amount = Math.max(0, baseAmount - deduction_amount + overtime_amount);
	const tax_rate = params.tax_rate ?? 10;
	const tax_amount = Math.round(amount * (tax_rate / 100));
	const total_amount = amount + tax_amount + travel;

	return {
		deduction_hours,
		deduction_amount,
		overtime_hours,
		overtime_amount,
		amount,
		tax_rate,
		tax_amount,
		travel_expenses: travel,
		total_amount
	};
}

export function enrichInvoice(
	invoice: Invoice,
	options?: {
		company?: CompanySettings;
		lookup?: InvoiceLookup;
		engineerName?: string;
		projectName?: string | null;
	}
): InvoiceDisplay {
	const rates = resolveDeductionOvertimeRates(invoice);
	const totals = calcInvoiceTotals({
		unit_price: invoice.unit_price,
		actual_hours: invoice.actual_hours ?? undefined,
		standard_hours_min: invoice.standard_hours_min ?? undefined,
		standard_hours_max: invoice.standard_hours_max ?? undefined,
		deduction_rate: rates.deduction_rate,
		overtime_rate: rates.overtime_rate,
		travel_expenses: invoice.travel_expenses ?? undefined,
		tax_rate: invoice.tax_rate ?? undefined
	});

	return {
		...invoice,
		...totals,
		engineer_name:
			options?.engineerName ?? resolveEngineerName(invoice, options?.lookup),
		project_name:
			options?.projectName !== undefined
				? options.projectName
				: resolveProjectName(invoice, options?.lookup)
	};
}

export function toInvoicePreview(
	invoice: Invoice,
	company: CompanySettings = DEFAULT_COMPANY_SETTINGS,
	lookup?: InvoiceLookup
): InvoicePreviewData {
	return {
		...enrichInvoice(invoice, { company, lookup }),
		company
	};
}

export function generateInvoiceNumber(existingCount: number): string {
	return String(existingCount + 1).padStart(7, '0');
}

export function applyStatusTimestamps(
	data: Pick<Invoice, 'status'>,
	prev?: Pick<Invoice, 'sent_at' | 'paid_at' | 'status'> | null,
	now = today()
): { sent_at: string | null; paid_at: string | null; updated_at: string } {
	const status: InvoiceStatus = data.status ?? '下書き';
	let sent_at = prev?.sent_at ?? null;
	let paid_at = prev?.paid_at ?? null;

	if (status === '送付済み' || status === '入金確認中' || status === '入金済み') {
		if (!sent_at) sent_at = now;
	}
	if (status === '入金済み') {
		if (!paid_at) paid_at = now;
	}

	return { sent_at, paid_at, updated_at: now };
}

export type InvoiceLineRow = {
	description: string;
	quantity: string;
	unitPrice: string;
	amount: string;
};

function emptyLineRow(): InvoiceLineRow {
	return { description: '', quantity: '', unitPrice: '', amount: '' };
}

function fmtGridNum(n: number): string {
	return n.toLocaleString();
}

export function buildInvoiceLineRows(preview: InvoicePreviewData): InvoiceLineRow[] {
	const rates = resolveDeductionOvertimeRates(preview);
	const totals = calcInvoiceTotals({
		unit_price: preview.unit_price,
		actual_hours: preview.actual_hours ?? undefined,
		standard_hours_min: preview.standard_hours_min ?? undefined,
		standard_hours_max: preview.standard_hours_max ?? undefined,
		deduction_rate: rates.deduction_rate,
		overtime_rate: rates.overtime_rate,
		travel_expenses: preview.travel_expenses ?? undefined,
		tax_rate: preview.tax_rate ?? undefined
	});

	const baseAmount = preview.unit_price * 10_000;
	const rows: InvoiceLineRow[] = [];

	rows.push(emptyLineRow());
	rows.push({
		description: billingMonthLabel(preview.billing_month),
		quantity: '',
		unitPrice: '',
		amount: ''
	});
	rows.push({
		description: preview.project_name ?? '',
		quantity: '',
		unitPrice: '',
		amount: ''
	});
	rows.push({
		description: `作業者：${preview.engineer_name || ''}`,
		quantity: '1',
		unitPrice: fmtGridNum(baseAmount),
		amount: String(baseAmount)
	});

	const hours =
		preview.actual_hours != null && preview.actual_hours > 0
			? `${preview.actual_hours}H`
			: '';
	rows.push({
		description: hours ? `作業時間：${hours}` : '作業時間：',
		quantity: '',
		unitPrice: '',
		amount: ''
	});

	if (totals.deduction_hours > 0) {
		rows.push({
			description: `控除時間：-${totals.deduction_hours}H　控除金額：${fmtGridNum(rates.deduction_rate)}`,
			quantity: String(-totals.deduction_hours),
			unitPrice: fmtGridNum(rates.deduction_rate),
			amount: String(-totals.deduction_amount)
		});
	}

	if (totals.overtime_hours > 0) {
		rows.push({
			description: `超過時間：+${totals.overtime_hours}H　超過金額：${fmtGridNum(rates.overtime_rate)}`,
			quantity: String(totals.overtime_hours),
			unitPrice: fmtGridNum(rates.overtime_rate),
			amount: String(totals.overtime_amount)
		});
	}

	while (rows.length < INVOICE_TABLE_ROW_COUNT) {
		rows.push(emptyLineRow());
	}

	return rows.slice(0, INVOICE_TABLE_ROW_COUNT);
}

export function buildInvoiceLookup(engineers: { id: string; name: string }[], projects: { id: string; name: string }[]): InvoiceLookup {
	return {
		engineerNames: new Map(engineers.map((e) => [e.id, e.name])),
		projectNames: new Map(projects.map((p) => [p.id, p.name]))
	};
}
