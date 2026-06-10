export type ProjectStatus = '商談中' | '稼働中' | '終了';

export type Project = {
	id: string;
	name: string;
	client_company?: string | null;
	client_address?: string | null;
	client_contact_name?: string | null;
	client_contact_email?: string | null;
	client_contact_tel?: string | null;
	agency_company?: string | null;
	agency_address?: string | null;
	agency_contact_name?: string | null;
	agency_contact_email?: string | null;
	status?: ProjectStatus;
	start_date?: string | null;
	end_date?: string | null;
	work_location?: string | null;
	remarks?: string | null;
};

export type Engineer = {
	id: string;
	name: string;
	name_kana?: string;
	age?: number;
	gender?: '男性' | '女性' | 'その他';
	nearest_station?: string;
	experience_years?: number;
	skills: string[];
	skill_summary?: string;
	desired_unit_price?: number;
	min_unit_price?: number;
	status: '待機中' | '商談中' | '稼働中' | '退場予定';
	availability_date?: string;
	project_id?: string;
	current_project?: string;
	contract_end_date?: string;
	engineer_type: '自社' | 'BP' | 'フリーランス';
	affiliation_company?: string;
	parent_company?: string;
	billing_unit_price?: number;
	standard_hours_min?: number;
	standard_hours_max?: number;
	hourly_deduction_rate?: number;
	hourly_overtime_rate?: number;
	cost_unit_price?: number;
	cost_deduction_rate?: number;
	cost_overtime_rate?: number;
	remarks?: string;
};

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
	order_amount?: number | null;
	amount_subtotal?: number | null;
	tax_amount?: number | null;
	unit_price?: number | null;
	cost_unit_price?: number | null;
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

export type InvoiceStatus = '下書き' | '送付済み' | '入金確認中' | '入金済み';

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
	sender_email_primary: string;
	sender_email_secondary: string;
};

export type InvoiceSendLog = {
	id: string;
	invoice_id: string;
	from_email: string;
	to_email: string;
	subject: string;
	body: string;
	status: 'sent' | 'failed';
	sent_at: string;
	error_message?: string | null;
};
