import type { CompanySettings } from '$lib/types';
import { DEFAULT_COMPANY_SETTINGS } from '$lib/utils/invoice-utils';

function createCompanySettingsStore() {
	let settings = $state<CompanySettings>({ ...DEFAULT_COMPANY_SETTINGS });

	return {
		get value(): CompanySettings {
			return settings;
		},
		set(data: CompanySettings) {
			settings = { ...data };
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
