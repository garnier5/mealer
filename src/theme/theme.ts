import type { TintKey } from '@/types';

const SOFT_SHADOW = '0px 1px 2px rgba(40,38,52,0.04), 0px 4px 14px rgba(40,38,52,0.05)';

export const THEMES = {
  light: {
    bg: '#F6F5F9', surface: '#FFFFFF', surface2: '#ECEAF2', line: '#E5E2EC',
    text: '#2A2733', text2: '#5D5868', text3: '#6A6575',
    accent: '#DEDAF0', accentInk: '#3D3466', tint: '#EEECF7', accentText: '#55498A', bar: '#A69CD3',
    warm: '#8C5A62', warmTint: '#F5E8EA', ocre: '#7D6740', ocreTint: '#F4EEE1',
    dash: '#C5BFDB', emptyBg: 'rgba(120,105,180,0.04)', shadow: SOFT_SHADOW,
    nav: '#FFFFFF', overlay: 'rgba(30,26,45,0.40)', toastBg: '#2A2733', toastFg: '#F6F5F9',
    code: '#FFFFFF', codeText: '#3D3466',
  },
  dark: {
    bg: '#14131A', surface: '#1D1C24', surface2: '#26252E', line: '#302E39',
    text: '#ECEAF2', text2: '#AEAAB9', text3: '#928E9E',
    accent: '#B9B0E6', accentInk: '#1D1838', tint: '#2A2638', accentText: '#C9C1F0', bar: '#9C92D0',
    warm: '#E3A3AD', warmTint: '#3A262B', ocre: '#E0BC7C', ocreTint: '#352C1C',
    dash: '#4A4560', emptyBg: 'rgba(185,176,230,0.05)', shadow: '0px 1px 0px rgba(255,255,255,0.03), 0px 6px 18px rgba(0,0,0,0.35)',
    nav: '#18171E', overlay: 'rgba(0,0,0,0.6)', toastBg: '#ECEAF2', toastFg: '#14131A',
    code: '#1D1C24', codeText: '#D9D3F0',
  },
};

export type Theme = typeof THEMES.light;

/** [background, foreground] for recipe tiles. */
export const TINTS: Record<'light' | 'dark', Record<TintKey, [string, string]>> = {
  light: { ocre: ['#F3ECDF', '#86704A'], sage: ['#E6ECE4', '#5A7260'], terra: ['#F3E6E0', '#93604C'], blue: ['#E3EAEF', '#536C7C'], plum: ['#ECE6EC', '#755F72'] },
  dark: { ocre: ['#352C1C', '#E0BC7C'], sage: ['#233027', '#A8CBAE'], terra: ['#3A2720', '#E8A283'], blue: ['#1E2D34', '#9CC0D1'], plum: ['#32262F', '#D2AECB'] },
};

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** `var(--…)` reference to every theme token, for inline styles. */
export const c = Object.fromEntries(Object.keys(THEMES.light).map((k) => [k, `var(--${kebab(k)})`])) as Record<keyof Theme, string>;

/** Publishes the palette as CSS custom properties and tints the browser chrome to match. */
export function applyTheme(t: Theme, dark: boolean) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(t)) root.style.setProperty('--' + kebab(k), v);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
}
