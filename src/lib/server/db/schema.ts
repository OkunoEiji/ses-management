import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	client_company: text('client_company'),
	client_address: text('client_address'),
	client_contact_name: text('client_contact_name'),
	client_contact_email: text('client_contact_email'),
	client_contact_tel: text('client_contact_tel'),
	agency_company: text('agency_company'),
	agency_address: text('agency_address'),
	agency_contact_name: text('agency_contact_name'),
	agency_contact_email: text('agency_contact_email'),
	status: text('status').notNull().default('商談中'),
	start_date: text('start_date'),
	end_date: text('end_date'),
	work_location: text('work_location'),
	remarks: text('remarks')
});

export const engineers = sqliteTable('engineers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	name_kana: text('name_kana'),
	age: integer('age'),
	gender: text('gender'),
	nearest_station: text('nearest_station'),
	experience_years: integer('experience_years'),
	skills: text('skills').notNull().default('[]'),
	skill_summary: text('skill_summary'),
	desired_unit_price: integer('desired_unit_price'),
	min_unit_price: integer('min_unit_price'),
	status: text('status').notNull().default('待機中'),
	availability_date: text('availability_date'),
	project_id: text('project_id').references(() => projects.id),
	contract_end_date: text('contract_end_date'),
	engineer_type: text('engineer_type').notNull().default('自社'),
	affiliation_company: text('affiliation_company'),
	parent_company: text('parent_company'),
	billing_unit_price: integer('billing_unit_price'),
	standard_hours_min: integer('standard_hours_min'),
	standard_hours_max: integer('standard_hours_max'),
	cost_unit_price: integer('cost_unit_price'),
	remarks: text('remarks')
});

export const companySettings = sqliteTable('company_settings', {
	id: text('id').primaryKey().default('default'),
	company_name: text('company_name').notNull(),
	postal_code: text('postal_code'),
	address: text('address').notNull(),
	building: text('building'),
	registration_number: text('registration_number').notNull(),
	bank_name: text('bank_name').notNull(),
	bank_branch: text('bank_branch').notNull(),
	bank_branch_code: text('bank_branch_code'),
	bank_account_type: text('bank_account_type').default('普通預金'),
	bank_account_name: text('bank_account_name').notNull(),
	bank_account_number: text('bank_account_number').notNull()
});

export const orders = sqliteTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	order_number: text('order_number'),
	issue_date: text('issue_date').notNull(),
	order_type: text('order_type').default('注文書'),
	project_id: text('project_id').references(() => projects.id),
	project_name: text('project_name').notNull(),
	engineer_id: text('engineer_id').references(() => engineers.id),
	engineer_name: text('engineer_name'),
	client_company: text('client_company').notNull(),
	sender_company: text('sender_company'),
	sender_registration_number: text('sender_registration_number'),
	sender_address: text('sender_address'),
	sender_signature: text('sender_signature'),
	order_amount: integer('order_amount'),
	amount_subtotal: integer('amount_subtotal'),
	tax_amount: integer('tax_amount'),
	unit_price: integer('unit_price'),
	cost_unit_price: integer('cost_unit_price'),
	engineer_affiliation_company: text('engineer_affiliation_company'),
	cost_deduction_rate: integer('cost_deduction_rate'),
	cost_overtime_rate: integer('cost_overtime_rate'),
	engineer_parent_company: text('engineer_parent_company'),
	months: integer('months'),
	period_start: text('period_start'),
	period_end: text('period_end'),
	standard_hours_min: integer('standard_hours_min'),
	standard_hours_max: integer('standard_hours_max'),
	overtime_rate: integer('overtime_rate'),
	deduction_rate: integer('deduction_rate'),
	contract_type: text('contract_type'),
	settlement_unit: text('settlement_unit'),
	transportation: text('transportation'),
	deliverable: text('deliverable'),
	tax_rate: integer('tax_rate').default(10),
	status: text('status').default('下書き'),
	notes: text('notes'),
	created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
	updated_at: text('updated_at')
});

/** 請求書（原本ベース・算出項目は DB に持たない） */
export const invoices = sqliteTable('invoices', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	invoice_number: text('invoice_number'),
	issue_date: text('issue_date').notNull(),
	due_date: text('due_date'),
	client_name: text('client_name').notNull(),
	engineer_id: text('engineer_id').references(() => engineers.id),
	project_id: text('project_id').references(() => projects.id),
	billing_month: text('billing_month').notNull(),
	unit_price: integer('unit_price').notNull(),
	actual_hours: integer('actual_hours'),
	standard_hours_min: integer('standard_hours_min').default(140),
	standard_hours_max: integer('standard_hours_max').default(180),
	deduction_rate: integer('deduction_rate'),
	overtime_rate: integer('overtime_rate'),
	travel_expenses: integer('travel_expenses').default(0),
	tax_rate: integer('tax_rate').default(10),
	status: text('status').default('下書き'),
	notes: text('notes'),
	created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
	updated_at: text('updated_at'),
	sent_at: text('sent_at'),
	paid_at: text('paid_at')
});
