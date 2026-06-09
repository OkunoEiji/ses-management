import type { Order } from '$lib/mock/orders';

export const NOTES_DEFAULT = `※支払日が金融機関の休日にあたる場合は、翌営業日となります。（振込み手数料は差し引いてお支払い致します。）
※機密保護の漏洩保護に関して注意を怠り事故を起こした場合、ペナルティー等の処分を受入れるものとします。
※受注側の過失により（勤怠不良、勤務態度不良、成果物の不良）途中終了する場合がございます。
　（別途協議させて頂きます。）`;

/** 注文書プレビュー用紙の幅（px） */
export const ORDER_PREVIEW_PAGE_WIDTH_PX = 794;

/** 注文書プレビュー用紙の高さ（px・A4相当） */
export const ORDER_PREVIEW_PAGE_HEIGHT_PX = 1123;

/** プレビュー枠（border + padding）込みの外側幅 */
export const ORDER_PREVIEW_PANEL_WIDTH_PX = ORDER_PREVIEW_PAGE_WIDTH_PX + 34;

export function generateOrderNumber(type: '注文書' | '注文請書', _existingCount: number): string {
	const y = new Date().getFullYear();
	const r = String(Math.floor(Math.random() * 9000) + 1000);
	return type === '注文書' ? `${y}-${r}M` : `${y}-${r}`;
}

export function calcRates(unitPriceMan: number, hMin: number, hMax: number) {
	const yen = unitPriceMan * 10_000;
	return {
		deduction: hMin > 0 ? Math.floor(yen / hMin / 10) * 10 : 0,
		overtime: hMax > 0 ? Math.floor(yen / hMax / 10) * 10 : 0
	};
}

export function calcOrderAmounts(unitPrice: number, months: number, taxRate = 10) {
	const amount_subtotal = Math.round(unitPrice * 10_000 * months);
	const tax_amount = Math.round(amount_subtotal * (taxRate / 100));
	return { amount_subtotal, tax_amount, order_amount: amount_subtotal + tax_amount };
}

/** 注文書プレビュー用: 支払側が未設定(0/null)なら請求側にフォールバック */
export function resolveOrderPreviewRate(
	cost: number | null | undefined,
	billing: number | null | undefined
): number {
	if (cost != null && cost > 0) return cost;
	return billing ?? 0;
}

/** フォーム入力からライブプレビュー用の Order を組み立てる */
export function toOrderPreview(data: Partial<Order> & Pick<Order, 'client_company'>): Order {
	const up = data.unit_price ?? 0;
	const months = data.months ?? 1;
	const calc = calcOrderAmounts(up, months);

	return {
		id: data.id ?? 'draft',
		order_number: data.order_number ?? null,
		order_type: data.order_type ?? '注文書',
		issue_date: data.issue_date ?? '',
		project_id: data.project_id ?? null,
		project_name: data.project_name?.trim() || 'SES業務委託費',
		engineer_id: data.engineer_id ?? null,
		engineer_name: data.engineer_name ?? null,
		client_company: data.client_company?.trim() || '（宛先未入力）',
		engineer_affiliation_company: data.engineer_affiliation_company ?? null,
		engineer_parent_company: data.engineer_parent_company ?? null,
		unit_price: up,
		months,
		period_start: data.period_start ?? null,
		period_end: data.period_end ?? null,
		standard_hours_min: data.standard_hours_min ?? 140,
		standard_hours_max: data.standard_hours_max ?? 180,
		overtime_rate: data.overtime_rate ?? 0,
		deduction_rate: data.deduction_rate ?? 0,
		cost_unit_price: data.cost_unit_price ?? 0,
		cost_deduction_rate: data.cost_deduction_rate ?? 0,
		cost_overtime_rate: data.cost_overtime_rate ?? 0,
		amount_subtotal: calc.amount_subtotal,
		tax_amount: calc.tax_amount,
		order_amount: calc.order_amount,
		contract_type: data.contract_type ?? '準委任',
		settlement_unit: data.settlement_unit ?? '15分　日/月共に',
		transportation: data.transportation ?? '基本単価に含む',
		deliverable: data.deliverable ?? '作業報告書',
		status: data.status ?? '下書き',
		notes: data.notes ?? null,
		created_at: data.created_at
	};
}
