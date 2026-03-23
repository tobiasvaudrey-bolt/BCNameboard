export const DEFAULT_THEME = 'bolt-chauffeur';

export const THEMES = {
  'bolt-chauffeur': { name: 'Bolt Chauffeur', bg: '#C4976B', text: '#000000', accent: '#E8D5B8' },
  classic:          { name: 'Classic',        bg: '#000000', text: '#FFFFFF', accent: '#333333' },
  inverted:         { name: 'Inverted',       bg: '#FFFFFF', text: '#222222', accent: '#E0E0E0' },
  midnight:         { name: 'Midnight',       bg: '#1A1A2E', text: '#E0E0FF', accent: '#2A2A4E' },
  amber:            { name: 'Amber',          bg: '#2D1B00', text: '#FFB800', accent: '#4A3000' },
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
