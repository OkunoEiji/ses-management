import { eq } from 'drizzle-orm';
import type { CompanySettings } from '$lib/types';
import { DEFAULT_COMPANY_SETTINGS } from '$lib/utils/invoice-utils';
import type { getDb } from '$lib/server/db';
import { companySettings } from '$lib/server/db/schema';
import { toCompanySettings } from '$lib/server/db/mappers';

type Db = ReturnType<typeof getDb>;

export async function getCompanySettings(db: Db): Promise<CompanySettings> {
	const rows = await db.select().from(companySettings).where(eq(companySettings.id, 'default'));
	if (rows.length === 0) {
		await db.insert(companySettings).values({
			id: 'default',
			company_name: DEFAULT_COMPANY_SETTINGS.company_name,
			postal_code: DEFAULT_COMPANY_SETTINGS.postal_code,
			address: DEFAULT_COMPANY_SETTINGS.address,
			building: DEFAULT_COMPANY_SETTINGS.building,
			registration_number: DEFAULT_COMPANY_SETTINGS.registration_number,
			bank_name: DEFAULT_COMPANY_SETTINGS.bank_name,
			bank_branch: DEFAULT_COMPANY_SETTINGS.bank_branch,
			bank_branch_code: DEFAULT_COMPANY_SETTINGS.bank_branch_code,
			bank_account_type: DEFAULT_COMPANY_SETTINGS.bank_account_type,
			bank_account_name: DEFAULT_COMPANY_SETTINGS.bank_account_name,
			bank_account_number: DEFAULT_COMPANY_SETTINGS.bank_account_number,
			sender_email_primary: DEFAULT_COMPANY_SETTINGS.sender_email_primary,
			sender_email_secondary: DEFAULT_COMPANY_SETTINGS.sender_email_secondary
		});
		return { ...DEFAULT_COMPANY_SETTINGS };
	}
	return toCompanySettings(rows[0]);
}

export async function updateCompanySettings(db: Db, data: CompanySettings): Promise<CompanySettings> {
	await db
		.insert(companySettings)
		.values({
			id: 'default',
			company_name: data.company_name,
			postal_code: data.postal_code || null,
			address: data.address,
			building: data.building ?? null,
			registration_number: data.registration_number,
			bank_name: data.bank_name,
			bank_branch: data.bank_branch,
			bank_branch_code: data.bank_branch_code ?? null,
			bank_account_type: data.bank_account_type,
			bank_account_name: data.bank_account_name,
			bank_account_number: data.bank_account_number,
			sender_email_primary: data.sender_email_primary || null,
			sender_email_secondary: data.sender_email_secondary || null
		})
		.onConflictDoUpdate({
			target: companySettings.id,
			set: {
				company_name: data.company_name,
				postal_code: data.postal_code || null,
				address: data.address,
				building: data.building ?? null,
				registration_number: data.registration_number,
				bank_name: data.bank_name,
				bank_branch: data.bank_branch,
				bank_branch_code: data.bank_branch_code ?? null,
				bank_account_type: data.bank_account_type,
				bank_account_name: data.bank_account_name,
				bank_account_number: data.bank_account_number,
				sender_email_primary: data.sender_email_primary || null,
				sender_email_secondary: data.sender_email_secondary || null
			}
		});
	return getCompanySettings(db);
}
