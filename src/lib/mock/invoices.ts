export type InvoiceStatus = '下書き' | '送付済み' | '入金確認中' | '入金済み';

/** DB に保存する請求書レコード（算出項目は含まない） */
export type Invoice = {
	id: string;
	invoice_number?: string | null;
	issue_date: string;
	due_date?: string | null;
	client_name: string;
	engineer_id?: string | null;
	project_id?: string | null;
	billing_month: string;
	unit_price: number;
	actual_hours?: number | null;
	standard_hours_min?: number | null;
	standard_hours_max?: number | null;
	deduction_rate?: number | null;
	overtime_rate?: number | null;
	travel_expenses?: number | null;
	tax_rate?: number | null;
	status?: InvoiceStatus;
	notes?: string | null;
	created_at?: string;
	updated_at?: string | null;
	sent_at?: string | null;
	paid_at?: string | null;
};

export type InvoiceInput = Omit<
	Invoice,
	'id' | 'created_at' | 'updated_at' | 'sent_at' | 'paid_at'
>;

export const invoices: Invoice[] = [
	{
		id: 'inv1',
		invoice_number: '0000002',
		engineer_id: '1',
		project_id: 'p1',
		client_name: 'フロントアーク',
		billing_month: '2026-05',
		unit_price: 70,
		actual_hours: 160,
		standard_hours_min: 140,
		standard_hours_max: 180,
		deduction_rate: 5000,
		overtime_rate: 5000,
		travel_expenses: 0,
		tax_rate: 10,
		issue_date: '2026-05-18',
		due_date: '2026-06-30',
		status: '送付済み',
		notes: null,
		created_at: '2026-05-18',
		sent_at: '2026-05-18'
	},
	{
		id: 'inv2',
		invoice_number: '0000003',
		engineer_id: '3',
		project_id: 'p3',
		client_name: '株式会社パートナーY',
		billing_month: '2026-06',
		unit_price: 80,
		actual_hours: 150,
		standard_hours_min: 140,
		standard_hours_max: 180,
		deduction_rate: 6000,
		overtime_rate: 6000,
		travel_expenses: 0,
		tax_rate: 10,
		issue_date: '2026-06-01',
		due_date: '2026-06-10',
		status: '入金確認中',
		notes: null,
		created_at: '2026-05-31',
		sent_at: '2026-06-01'
	},
	{
		id: 'inv3',
		invoice_number: '0000004',
		engineer_id: '2',
		project_id: 'p1',
		client_name: '株式会社エージェントX',
		billing_month: '2026-04',
		unit_price: 68,
		actual_hours: 145,
		standard_hours_min: 140,
		standard_hours_max: 180,
		deduction_rate: 5000,
		overtime_rate: 5000,
		travel_expenses: 0,
		tax_rate: 10,
		issue_date: '2026-04-30',
		due_date: '2026-05-15',
		status: '送付済み',
		notes: '支払期限超過のテスト用',
		created_at: '2026-05-31',
		sent_at: '2026-04-30'
	},
	{
		id: 'inv4',
		invoice_number: '0000005',
		engineer_id: '1',
		project_id: null,
		client_name: '株式会社クライアントA',
		billing_month: '2026-05',
		unit_price: 70,
		actual_hours: 140,
		standard_hours_min: 140,
		standard_hours_max: 180,
		travel_expenses: 0,
		tax_rate: 10,
		issue_date: '2026-05-25',
		due_date: '2026-06-25',
		status: '下書き',
		notes: '案件未紐づけの下書き',
		created_at: '2026-05-31'
	},
	{
		id: 'inv5',
		invoice_number: '0000099',
		engineer_id: '3',
		project_id: 'p3',
		client_name: '株式会社パートナーY',
		billing_month: '2026-03',
		unit_price: 80,
		actual_hours: 160,
		standard_hours_min: 140,
		standard_hours_max: 180,
		travel_expenses: 5000,
		tax_rate: 10,
		issue_date: '2026-03-31',
		due_date: '2026-04-30',
		status: '入金済み',
		notes: null,
		created_at: '2026-05-31',
		sent_at: '2026-03-31',
		paid_at: '2026-04-28'
	}
];

export function findInvoice(id: string): Invoice | undefined {
	return invoices.find((inv) => inv.id === id);
}

export function findInvoicesByEngineerId(engineerId: string): Invoice[] {
	return invoices.filter((inv) => inv.engineer_id === engineerId);
}

export function findInvoicesByProjectId(projectId: string): Invoice[] {
	return invoices.filter((inv) => inv.project_id === projectId);
}
