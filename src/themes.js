export const DEFAULT_THEME = 'bolt-chauffeur';

export const THEMES = {
  'bolt-chauffeur': { name: 'Bolt Chauffeur', bg: '#34BB78', text: '#000000' },
  classic:          { name: 'Classic',        bg: '#000000', text: '#FFFFFF' },
  inverted:         { name: 'Inverted',       bg: '#FFFFFF', text: '#222222' },
  midnight:         { name: 'Midnight',       bg: '#1A1A2E', text: '#E0E0FF' },
  amber:            { name: 'Amber',          bg: '#2D1B00', text: '#FFB800' },
};

export const THEME_SLUGS = Object.keys(THEMES);

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
