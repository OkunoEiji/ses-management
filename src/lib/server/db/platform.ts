import { error } from '@sveltejs/kit';
import { getDb } from './index';

export function requireDb(platform: App.Platform | undefined) {
	const d1 = platform?.env?.ses_management;
	if (!d1) {
		error(500, 'Database is not available');
	}
	return getDb(d1);
}
