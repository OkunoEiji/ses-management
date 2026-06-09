export type OrderStatus = '下書き' | '送付済み' | '承認済み';
export type OrderType = '注文書' | '注文請書';
export type ContractType = '準委任' | '派遣';
export type Transportation = '基本単価に含む' | '別途精算';

export type Order = {
	id: string;
	order_number?: string | null;
	issue_date: string;
	order_type?: OrderType;
	project_id?: string | null;
	project_name: string;
	engineer_id?: string | null;
	engineer_name?: string | null;
	client_company: string;
	sender_company?: string | null;
	sender_registration_number?: string | null;
	sender_address?: string | null;
	sender_signature?: string | null;
	order_amount?: number | null;
	amount_subtotal?: number | null;
	tax_amount?: number | null;
	unit_price?: number | null;
	/** 支払単価（万円/月）— 所属向け注文書タブ用 */
	cost_unit_price?: number | null;
	/** 要員の所属会社 — 所属向け注文書タブ用 */
	engineer_affiliation_company?: string | null;
	cost_deduction_rate?: number | null;
	cost_overtime_rate?: number | null;
	engineer_parent_company?: string | null;
	months?: number | null;
	period_start?: string | null;
	period_end?: string | null;
	standard_hours_min?: number | null;
	standard_hours_max?: number | null;
	overtime_rate?: number | null;
	deduction_rate?: number | null;
	contract_type?: ContractType;
	settlement_unit?: string | null;
	transportation?: Transportation;
	deliverable?: string | null;
	status?: OrderStatus;
	notes?: string | null;
	created_at?: string;
	updated_at?: string | null;
};

const DEFAULT_SENDER = {
	sender_company: '株式会社SES管理',
	sender_registration_number: 'T1234567890123',
	sender_address: '東京都渋谷区1-2-3',
	sender_signature: '株式会社SES管理'
} as const;

function calcOrderAmounts(unitPrice: number, months: number, taxRate = 10) {
	const amount_subtotal = unitPrice * 10_000 * months;
	const tax_amount = Math.round(amount_subtotal * (taxRate / 100));
	const order_amount = amount_subtotal + tax_amount;
	return { amount_subtotal, tax_amount, order_amount };
}

export const orderSheets: Order[] = [
	(() => {
		const unit_price = 68;
		const months = 4;
		const amounts = calcOrderAmounts(unit_price, months);
		return {
			id: 'ord1',
			order_number: 'ORD-2026-0001',
			issue_date: '2026-06-01',
			order_type: '注文書',
			project_id: 'p1',
			project_name: '基幹システム保守開発',
			engineer_id: '2',
			engineer_name: '佐藤花子',
			client_company: '株式会社エージェントX',
			engineer_affiliation_company: null,
			...DEFAULT_SENDER,
			...amounts,
			unit_price,
			cost_unit_price: 55,
			months,
			period_start: '2026-06-01',
			period_end: '2026-09-30',
			standard_hours_min: 140,
			standard_hours_max: 180,
			overtime_rate: 5000,
			deduction_rate: 5000,
			contract_type: '準委任',
			settlement_unit: '15分　日/月共に',
			transportation: '基本単価に含む',
			deliverable: '作業報告書',
			status: '承認済み',
			notes: 'リモート併用可。作業報告書は月末提出。',
			created_at: '2026-05-28',
			updated_at: '2026-06-05'
		} satisfies Order;
	})(),
	(() => {
		const unit_price = 82;
		const months = 6;
		const amounts = calcOrderAmounts(unit_price, months);
		return {
			id: 'ord2',
			order_number: 'ORD-2025-0012',
			issue_date: '2025-10-01',
			order_type: '注文書',
			project_id: 'p3',
			project_name: 'データ基盤整備',
			engineer_id: '3',
			engineer_name: '鈴木一郎',
			client_company: '株式会社パートナーY',
			engineer_affiliation_company: '株式会社テックパートナー',
			...DEFAULT_SENDER,
			...amounts,
			unit_price,
			cost_unit_price: 70,
			months,
			period_start: '2025-10-01',
			period_end: '2026-03-31',
			standard_hours_min: 140,
			standard_hours_max: 180,
			overtime_rate: 6000,
			deduction_rate: 6000,
			contract_type: '準委任',
			settlement_unit: '15分　日/月共に',
			transportation: '別途精算',
			deliverable: '作業報告書',
			status: '承認済み',
			notes: 'BP要員。交通費は実費精算。',
			created_at: '2025-09-25',
			updated_at: '2025-10-05'
		} satisfies Order;
	})(),
	(() => {
		const unit_price = 75;
		const months = 1;
		const amounts = calcOrderAmounts(unit_price, months);
		return {
			id: 'ord3',
			order_number: 'ORD-2026-0002',
			issue_date: '2026-05-15',
			order_type: '注文書',
			project_id: 'p2',
			project_name: 'ECサイト機能追加',
			engineer_id: '4',
			engineer_name: '田中次郎',
			client_company: '株式会社クライアントB',
			engineer_affiliation_company: null,
			...DEFAULT_SENDER,
			...amounts,
			unit_price,
			cost_unit_price: null,
			months,
			period_start: '2026-07-01',
			period_end: '2026-07-31',
			standard_hours_min: 140,
			standard_hours_max: 180,
			overtime_rate: 5500,
			deduction_rate: 5500,
			contract_type: '準委任',
			settlement_unit: '15分　日/月共に',
			transportation: '基本単価に含む',
			deliverable: '作業報告書',
			status: '下書き',
			notes: '商談中のため未送付。単価は面談後確定予定。',
			created_at: '2026-05-15',
			updated_at: '2026-05-15'
		} satisfies Order;
	})(),
	(() => {
		const unit_price = 68;
		const months = 1;
		const amounts = calcOrderAmounts(unit_price, months);
		return {
			id: 'ord4',
			order_number: 'ORD-2026-0003',
			issue_date: '2026-05-20',
			order_type: '注文請書',
			project_id: 'p1',
			project_name: '基幹システム保守開発',
			engineer_id: '2',
			engineer_name: '佐藤花子',
			client_company: '株式会社エージェントX',
			engineer_affiliation_company: null,
			...DEFAULT_SENDER,
			...amounts,
			unit_price,
			cost_unit_price: 55,
			months,
			period_start: '2026-06-01',
			period_end: '2026-06-30',
			standard_hours_min: 140,
			standard_hours_max: 180,
			overtime_rate: 5000,
			deduction_rate: 5000,
			contract_type: '準委任',
			settlement_unit: '15分　日/月共に',
			transportation: '基本単価に含む',
			deliverable: '作業報告書',
			status: '送付済み',
			notes: '6月分の注文請書。上位会社確認待ち。',
			created_at: '2026-05-20',
			updated_at: '2026-05-22'
		} satisfies Order;
	})(),
	(() => {
		const unit_price = 55;
		const months = 1;
		const amounts = calcOrderAmounts(unit_price, months);
		return {
			id: 'ord5',
			order_number: 'ORD-2026-0004',
			issue_date: '2026-05-10',
			order_type: '注文書',
			project_id: 'p2',
			project_name: 'ECサイト機能追加',
			engineer_id: '5',
			engineer_name: '高橋美咲',
			client_company: '株式会社クライアントB',
			engineer_affiliation_company: null,
			...DEFAULT_SENDER,
			...amounts,
			unit_price,
			cost_unit_price: null,
			months,
			period_start: '2026-07-01',
			period_end: '2026-07-31',
			standard_hours_min: 140,
			standard_hours_max: 180,
			overtime_rate: 4000,
			deduction_rate: 4000,
			contract_type: '派遣',
			settlement_unit: '15分　日/月共に',
			transportation: '基本単価に含む',
			deliverable: '作業報告書',
			status: '送付済み',
			notes: null,
			created_at: '2026-05-10',
			updated_at: '2026-05-12'
		} satisfies Order;
	})()
];

export function findOrderSheet(id: string): Order | undefined {
	return orderSheets.find((o) => o.id === id);
}

export function findOrderSheetsByProjectId(projectId: string): Order[] {
	return orderSheets.filter((o) => o.project_id === projectId);
}

export function findOrderSheetsByEngineerId(engineerId: string): Order[] {
	return orderSheets.filter((o) => o.engineer_id === engineerId);
}