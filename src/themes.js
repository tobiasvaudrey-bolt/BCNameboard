export const DEFAULT_THEME = 'bolt-chauffeur';

export const THEMES = {
  'bolt-chauffeur': { name: 'Bolt Chauffeur', bg: '#C4976B', text: '#000000', accent: '#E8D5B8' },
};

export function resolveTheme(slug) {
  if (slug && THEMES[slug]) return slug;
  return getSavedTheme();
}

export function getSavedTheme() {
  try {
    const stored = localStorage.getItem('nameboard-theme');
    if (stored && THEMES[stored]) return stored;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_THEME;
}

export function saveTheme(slug) {
  try {
    localStorage.setItem('nameboard-theme', slug);
  } catch {
    // localStorage unavailable
  }
}

export function applyThemeToDOM(slug) {
  const theme = THEMES[slug] || THEMES[DEFAULT_THEME];
  document.documentElement.style.setProperty('--theme-bg', theme.bg);
  document.documentElement.style.setProperty('--theme-text', theme.text);
}
