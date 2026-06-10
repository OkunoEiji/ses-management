export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return null;
}

export function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function resolveTheme(): Theme {
	return getStoredTheme() ?? getSystemTheme();
}

export function persistTheme(theme: Theme) {
	localStorage.setItem(STORAGE_KEY, theme);
}
