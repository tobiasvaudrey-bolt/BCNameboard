import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { parseHash, buildHash } from '../src/hash.js';
import {
  THEMES,
  DEFAULT_THEME,
  resolveTheme,
  getSavedTheme,
  saveTheme,
} from '../src/themes.js';

// ---------------------------------------------------------------------------
// Helper: WCAG relative luminance + contrast
// ---------------------------------------------------------------------------
function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ===========================================================================
// URL Parsing Tests
// ===========================================================================
describe('parseHash', () => {
  it('parses name and theme from hash', () => {
    expect(parseHash('#name=John+Smith&theme=classic')).toEqual({
      name: 'John Smith',
      theme: 'classic',
    });
  });

  it('parses percent-encoded name', () => {
    expect(parseHash('#name=John%20Smith')).toEqual({
      name: 'John Smith',
      theme: null,
    });
  });

  it('returns nulls for empty string', () => {
    expect(parseHash('')).toEqual({ name: null, theme: null });
  });

  it('returns empty name for #name= (empty value)', () => {
    expect(parseHash('#name=')).toEqual({ name: '', theme: null });
  });

  it('handles unicode characters', () => {
    const result = parseHash('#name=%C3%89milie');
    expect(result.name).toBe('Émilie');
    expect(result.theme).toBeNull();
  });

  it('handles name with special characters', () => {
    const result = parseHash('#name=O%27Brien');
    expect(result.name).toBe("O'Brien");
  });
});

describe('buildHash', () => {
  it('builds hash with name and theme', () => {
    expect(buildHash('Jane', 'midnight')).toBe('#name=Jane&theme=midnight');
  });

  it('builds hash with name only', () => {
    const hash = buildHash('Jane', null);
    expect(hash).toContain('name=Jane');
    expect(hash).not.toContain('theme=');
  });

  it('builds empty hash when no name or theme', () => {
    expect(buildHash(null, null)).toBe('#');
  });
});

describe('parseHash / buildHash round-trip', () => {
  const cases = [
    { name: 'Alice', theme: 'classic' },
    { name: 'Dr. Muhammad Al-Rashid', theme: 'bolt-chauffeur' },
    { name: 'Émilie Dupont', theme: null },
    { name: "O'Brien Family", theme: 'amber' },
  ];

  cases.forEach(({ name, theme }) => {
    it(`round-trips "${name}" with theme ${theme}`, () => {
      const hash = buildHash(name, theme);
      const parsed = parseHash(hash);
      expect(parsed.name).toBe(name);
      expect(parsed.theme).toBe(theme);
    });
  });
});

// ===========================================================================
// Theme Tests
// ===========================================================================
describe('THEMES', () => {
  it('has only the bolt-chauffeur theme', () => {
    expect(Object.keys(THEMES)).toEqual(['bolt-chauffeur']);
  });

  it('bolt-chauffeur has bg, text, and accent hex colors', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    const theme = THEMES['bolt-chauffeur'];
    expect(theme.bg).toMatch(hexPattern);
    expect(theme.text).toMatch(hexPattern);
    expect(theme.accent).toMatch(hexPattern);
  });

  it('bolt-chauffeur passes WCAG AAA contrast (7:1)', () => {
    const theme = THEMES['bolt-chauffeur'];
    const ratio = contrastRatio(theme.bg, theme.text);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it('bolt-chauffeur has a human-readable name', () => {
    expect(THEMES['bolt-chauffeur'].name).toBe('Bolt Chauffeur');
  });

  it('bolt-chauffeur theme uses branded brown', () => {
    expect(THEMES['bolt-chauffeur'].bg).toBe('#C4976B');
  });
});

describe('DEFAULT_THEME', () => {
  it('is bolt-chauffeur', () => {
    expect(DEFAULT_THEME).toBe('bolt-chauffeur');
  });

  it('exists in THEMES', () => {
    expect(THEMES).toHaveProperty(DEFAULT_THEME);
  });
});

describe('getSavedTheme', () => {
  beforeEach(() => localStorage.clear());

  it('returns bolt-chauffeur when no localStorage value', () => {
    expect(getSavedTheme()).toBe('bolt-chauffeur');
  });

  it('returns stored value when set to a valid theme', () => {
    localStorage.setItem('nameboard-theme', 'bolt-chauffeur');
    expect(getSavedTheme()).toBe('bolt-chauffeur');
  });

  it('returns bolt-chauffeur for invalid localStorage value', () => {
    localStorage.setItem('nameboard-theme', 'nonexistent');
    expect(getSavedTheme()).toBe('bolt-chauffeur');
  });
});

describe('saveTheme', () => {
  beforeEach(() => localStorage.clear());

  it('persists theme to localStorage', () => {
    saveTheme('bolt-chauffeur');
    expect(localStorage.getItem('nameboard-theme')).toBe('bolt-chauffeur');
  });
});

describe('resolveTheme', () => {
  beforeEach(() => localStorage.clear());

  it('returns the theme if it exists in THEMES', () => {
    expect(resolveTheme('bolt-chauffeur')).toBe('bolt-chauffeur');
  });

  it('falls back to default for unknown slug', () => {
    expect(resolveTheme('unknown-theme')).toBe('bolt-chauffeur');
  });

  it('falls back to default for null', () => {
    expect(resolveTheme(null)).toBe('bolt-chauffeur');
  });
});

// ===========================================================================
// PWA Manifest Tests
// ===========================================================================
describe('manifest.json', () => {
  let manifest;

  beforeEach(() => {
    try {
      const raw = readFileSync(resolve(__dirname, '../public/manifest.json'), 'utf-8');
      manifest = JSON.parse(raw);
    } catch {
      manifest = null;
    }
  });

  it('is valid JSON', () => {
    expect(manifest).not.toBeNull();
  });

  it('has required fields', () => {
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('icons');
  });

  it('display is standalone', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('has a 192x192 icon', () => {
    const icon = manifest.icons.find((i) => i.sizes === '192x192');
    expect(icon).toBeDefined();
  });

  it('has a 512x512 icon', () => {
    const icon = manifest.icons.find((i) => i.sizes === '512x512');
    expect(icon).toBeDefined();
  });

  it('is named Bolt Chauffeur Nameboard', () => {
    expect(manifest.name).toBe('Bolt Chauffeur Nameboard');
  });
});

// ===========================================================================
// Service Worker Tests
// ===========================================================================
describe('Service Worker (sw.js)', () => {
  let swContent;

  beforeEach(() => {
    try {
      swContent = readFileSync(resolve(__dirname, '../public/sw.js'), 'utf-8');
    } catch {
      swContent = null;
    }
  });

  it('file exists', () => {
    expect(swContent).not.toBeNull();
  });

  it('is syntactically valid JS', () => {
    expect(() => new Function(swContent)).not.toThrow();
  });

  it('has a CACHE_VERSION constant', () => {
    expect(swContent).toMatch(/CACHE_VERSION/);
  });

  it('pre-caches index.html', () => {
    expect(swContent).toMatch(/index\.html/);
  });

  it('pre-caches manifest.json', () => {
    expect(swContent).toMatch(/manifest\.json/);
  });
});

// ===========================================================================
// React Component Tests
// ===========================================================================
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';

describe('App component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders the input screen by default', () => {
    render(<App />);
    const logos = screen.getAllByLabelText('Bolt Chauffeur logo');
    expect(logos.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText('e.g. John Smith')).toBeInTheDocument();
  });

  it('renders the Display Name button', () => {
    render(<App />);
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('has a passenger name input', () => {
    render(<App />);
    const input = screen.getByLabelText('Passenger name');
    expect(input).toBeInTheDocument();
  });

  it('pre-fills input when hash has a name', () => {
    window.location.hash = '#name=John+Smith&theme=classic';
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.value).toBe('John Smith');
  });

  it('does not render any theme picker buttons', () => {
    render(<App />);
    const themeButtons = screen.queryAllByRole('button', { name: /theme/i });
    expect(themeButtons.length).toBe(0);
  });
});

// ===========================================================================
// Clipboard Tests
// ===========================================================================
describe('Clipboard', () => {
  it('navigator.clipboard.writeText is callable', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    navigator.clipboard.writeText('https://example.com/#name=Test');
    expect(writeText).toHaveBeenCalledWith('https://example.com/#name=Test');
  });
});
