import { calcRates } from '$lib/utils/order-utils';
import type {
	CompanySettings,
	Engineer,
	Invoice,
	Order,
	Project
} from '$lib/types';
import type {
	companySettings,
	engineers,
	invoices,
	orders,
	projects
} from './schema';

type DbProject = typeof projects.$inferSelect;
type DbEngineer = typeof engineers.$inferSelect;
type DbOrder = typeof orders.$inferSelect;
type DbInvoice = typeof invoices.$inferSelect;
type DbCompanySettings = typeof companySettings.$inferSelect;

export function toProject(row: DbProject): Project {
	return { ...row, status: (row.status as Project['status']) ?? '商談中' };
}

export function toEngineer(row: DbEngineer, projectName?: string | null): Engineer {
	const skills = JSON.parse(row.skills || '[]') as string[];
	const stdMin = row.standard_hours_min ?? 140;
	const stdMax = row.standard_hours_max ?? 180;
	const billingUp = row.billing_unit_price ?? 0;
	const costUp = row.cost_unit_price ?? 0;
	const billingRates = calcRates(billingUp, stdMin, stdMax);
	const costRates = calcRates(costUp, stdMin, stdMax);

	return {
		id: row.id,
		name: row.name,
		name_kana: row.name_kana ?? undefined,
		age: row.age ?? undefined,
		gender: (row.gender as Engineer['gender']) ?? undefined,
		nearest_station: row.nearest_station ?? undefined,
		experience_years: row.experience_years ?? undefined,
		skills,
		skill_summary: row.skill_summary ?? undefined,
		desired_unit_price: row.desired_unit_price ?? undefined,
		min_unit_price: row.min_unit_price ?? undefined,
		status: row.status as Engineer['status'],
		availability_date: row.availability_date ?? undefined,
		project_id: row.project_id ?? undefined,
		current_project: projectName ?? undefined,
		contract_end_date: row.contract_end_date ?? undefined,
		engineer_type: row.engineer_type as Engineer['engineer_type'],
		affiliation_company: row.affiliation_company ?? undefined,
		parent_company: row.parent_company ?? undefined,
		billing_unit_price: row.billing_unit_price ?? undefined,
		standard_hours_min: row.standard_hours_min ?? undefined,
		standard_hours_max: row.standard_hours_max ?? undefined,
		hourly_deduction_rate: billingRates.deduction || undefined,
		hourly_overtime_rate: billingRates.overtime || undefined,
		cost_unit_price: row.cost_unit_price ?? undefined,
		cost_deduction_rate: costRates.deduction || undefined,
		cost_overtime_rate: costRates.overtime || undefined,
		remarks: row.remarks ?? undefined
	};
}

export function engineerToDb(data: Omit<Engineer, 'id' | 'current_project' | 'hourly_deduction_rate' | 'hourly_overtime_rate' | 'cost_deduction_rate' | 'cost_overtime_rate'>) {
	return {
		name: data.name,
		name_kana: data.name_kana ?? null,
		age: data.age ?? null,
		gender: data.gender ?? null,
		nearest_station: data.nearest_station ?? null,
		experience_years: data.experience_years ?? null,
		skills: JSON.stringify(data.skills ?? []),
		skill_summary: data.skill_summary ?? null,
		desired_unit_price: data.desired_unit_price ?? null,
		min_unit_price: data.min_unit_price ?? null,
		status: data.status,
		availability_date: data.availability_date ?? null,
		project_id: data.project_id ?? null,
		contract_end_date: data.contract_end_date ?? null,
		engineer_type: data.engineer_type,
		affiliation_company: data.affiliation_company ?? null,
		parent_company: data.parent_company ?? null,
		billing_unit_price: data.billing_unit_price ?? null,
		standard_hours_min: data.standard_hours_min ?? null,
		standard_hours_max: data.standard_hours_max ?? null,
		cost_unit_price: data.cost_unit_price ?? null,
		remarks: data.remarks ?? null
	};
}

export function toOrder(row: DbOrder): Order {
	return {
		...row,
		order_type: (row.order_type as Order['order_type']) ?? '注文書',
		contract_type: (row.contract_type as Order['contract_type']) ?? undefined,
		transportation: (row.transportation as Order['transportation']) ?? undefined,
		status: (row.status as Order['status']) ?? '下書き'
	};
}

export function orderToDb(data: Omit<Order, 'id'>) {
	return {
		order_number: data.order_number ?? null,
		issue_date: data.issue_date,
		order_type: data.order_type ?? '注文書',
		project_id: data.project_id ?? null,
		project_name: data.project_name,
		engineer_id: data.engineer_id ?? null,
		engineer_name: data.engineer_name ?? null,
		client_company: data.client_company,
		order_amount: data.order_amount ?? null,
		amount_subtotal: data.amount_subtotal ?? null,
		tax_amount: data.tax_amount ?? null,
		unit_price: data.unit_price ?? null,
		cost_unit_price: data.cost_unit_price ?? null,
		engineer_affiliation_company: data.engineer_affiliation_company ?? null,
		cost_deduction_rate: data.cost_deduction_rate ?? null,
		cost_overtime_rate: data.cost_overtime_rate ?? null,
		engineer_parent_company: data.engineer_parent_company ?? null,
		months: data.months ?? null,
		period_start: data.period_start ?? null,
		period_end: data.period_end ?? null,
		standard_hours_min: data.standard_hours_min ?? null,
		standard_hours_max: data.standard_hours_max ?? null,
		overtime_rate: data.overtime_rate ?? null,
		deduction_rate: data.deduction_rate ?? null,
		contract_type: data.contract_type ?? null,
		settlement_unit: data.settlement_unit ?? null,
		transportation: data.transportation ?? null,
		deliverable: data.deliverable ?? null,
		tax_rate: 10,
		status: data.status ?? '下書き',
		notes: data.notes ?? null,
		created_at: data.created_at,
		updated_at: data.updated_at ?? null
	};
}

export function toInvoice(row: DbInvoice): Invoice {
	return {
		...row,
		status: (row.status as Invoice['status']) ?? '下書き'
	};
}

export function invoiceToDb(data: Omit<Invoice, 'id'>) {
	return {
		invoice_number: data.invoice_number ?? null,
		issue_date: data.issue_date,
		due_date: data.due_date ?? null,
		client_name: data.client_name,
		engineer_id: data.engineer_id ?? null,
		project_id: data.project_id ?? null,
		billing_month: data.billing_month,
		unit_price: data.unit_price,
		actual_hours: data.actual_hours ?? null,
		standard_hours_min: data.standard_hours_min ?? 140,
		standard_hours_max: data.standard_hours_max ?? 180,
		deduction_rate: data.deduction_rate ?? null,
		overtime_rate: data.overtime_rate ?? null,
		travel_expenses: data.travel_expenses ?? 0,
		tax_rate: data.tax_rate ?? 10,
		status: data.status ?? '下書き',
		notes: data.notes ?? null,
		created_at: data.created_at,
		updated_at: data.updated_at ?? null,
		sent_at: data.sent_at ?? null,
		paid_at: data.paid_at ?? null
	};
}

export function toCompanySettings(row: DbCompanySettings): CompanySettings {
	return {
		id: row.id,
		company_name: row.company_name,
		postal_code: row.postal_code ?? '',
		address: row.address,
		building: row.building,
		registration_number: row.registration_number,
		bank_name: row.bank_name,
		bank_branch: row.bank_branch,
		bank_branch_code: row.bank_branch_code,
		bank_account_type: row.bank_account_type ?? '普通預金',
		bank_account_name: row.bank_account_name,
		bank_account_number: row.bank_account_number,
		sender_email_primary: row.sender_email_primary ?? '',
		sender_email_secondary: row.sender_email_secondary ?? ''
	};
}
