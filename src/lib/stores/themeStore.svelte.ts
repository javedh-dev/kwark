import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	let theme = $state<Theme>('system');

	function init() {
		if (!browser) return;

		const storedTheme = localStorage.getItem('theme') as Theme | null;
		if (storedTheme) {
			theme = storedTheme;
		} else {
			theme = 'system';
		}

		applyTheme(theme);
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem('theme', newTheme);
			applyTheme(newTheme);
		}
	}

	function applyTheme(t: Theme) {
		if (!browser) return;

		const root = document.documentElement;
		const isDark =
			t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

		if (isDark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}

	return {
		get theme() {
			return theme;
		},
		setTheme,
		init
	};
}

export const themeStore = createThemeStore();
