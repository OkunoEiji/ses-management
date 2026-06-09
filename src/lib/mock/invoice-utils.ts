import type { Invoice, InvoiceStatus } from '$lib/mock/invoices';
import { engineers } from '$lib/mock/engineers';
import { projects } from '$lib/mock/projects';
import { calcRates } from '$lib/mock/order-utils';
import { today } from '$lib/utils';

/** 自社情報（請求書原本の発行元・振込先） */
export type CompanySettings = {
	id: string;
	company_name: string;
	postal_code: string;
	address: string;
	building?: string | null;
	registration_number: string;
	bank_name: string;
	bank_branch: string;
	bank_branch_code?: string | null;
	bank_account_type: string;
	bank_account_name: string;
	bank_account_number: string;
};

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
	bank_account_number: '1969203'
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

export function billingMonthLabel(billingMonth: string): string {
	const [y, m] = billingMonth.split('-');
	if (!y || !m) return billingMonth;
	return `${y}年${m}月分`;
}

export function resolveEngineerName(invoice: Pick<Invoice, 'engineer_id'>): string {
	if (!invoice.engineer_id) return '';
	return engineers.find((e) => e.id === invoice.engineer_id)?.name ?? '';
}

export function resolveProjectName(invoice: Pick<Invoice, 'project_id'>): string | null {
	if (!invoice.project_id) return null;
	return projects.find((p) => p.id === invoice.project_id)?.name ?? null;
}

export function resolveDeductionOvertimeRates(invoice: Pick<Invoice, 'deduction_rate' | 'overtime_rate' | 'unit_price' | 'standard_hours_min' | 'standard_hours_max'>) {
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

/** 実稼働時間から控除・超過・税込合計を算出（交通費・宿泊費込み） */
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
	company: CompanySettings = DEFAULT_COMPANY_SETTINGS
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
		engineer_name: resolveEngineerName(invoice),
		project_name: resolveProjectName(invoice)
	};
}

export function toInvoicePreview(
	invoice: Invoice,
	company: CompanySettings = DEFAULT_COMPANY_SETTINGS
): InvoicePreviewData {
	return {
		...enrichInvoice(invoice, company),
		company
	};
}

export function generateInvoiceNumber(existingCount: number): string {
	const year = today().slice(0, 4);
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

/** 請求書原本の明細行（作業者・作業時間 + 空行） */
export function buildInvoiceLineRows(preview: InvoicePreviewData): InvoiceLineRow[] {
	return [
		{
			description: `作業者: ${preview.engineer_name || ''}`,
			quantity: '1',
			unitPrice: '',
			amount: '0'
		},
		{
			description: '作業時間:',
			quantity: preview.actual_hours != null ? String(preview.actual_hours) : '',
			unitPrice: '',
			amount: '0'
		}
	];
}

export const INVOICE_TABLE_EMPTY_ROW_COUNT = 15;
