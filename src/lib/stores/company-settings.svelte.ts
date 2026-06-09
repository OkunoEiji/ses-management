import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '$lib/mock/invoice-utils';

function createCompanySettingsStore() {
	let settings = $state<CompanySettings>({ ...DEFAULT_COMPANY_SETTINGS });

	return {
		get value(): CompanySettings {
			return settings;
		},
		update(data: Partial<CompanySettings>) {
			Object.assign(settings, data);
		},
		reset() {
			Object.assign(settings, { ...DEFAULT_COMPANY_SETTINGS });
		}
	};
}

export const companySettings = createCompanySettingsStore();
