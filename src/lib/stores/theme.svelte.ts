import { applyTheme, persistTheme, resolveTheme, type Theme } from '$lib/utils/theme';

function createThemeStore() {
	let theme = $state<Theme>('light');

	return {
		get value(): Theme {
			return theme;
		},
		get isDark(): boolean {
			return theme === 'dark';
		},
		init() {
			if (typeof window === 'undefined') return;
			theme = resolveTheme();
			applyTheme(theme);
		},
		toggle() {
			theme = theme === 'light' ? 'dark' : 'light';
			persistTheme(theme);
			applyTheme(theme);
		},
		set(next: Theme) {
			theme = next;
			persistTheme(theme);
			applyTheme(theme);
		}
	};
}

export const theme = createThemeStore();
