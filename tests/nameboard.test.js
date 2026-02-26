import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// We import lib.js functions directly for unit tests.
// The actual file doesn't exist yet (TDD) – tests will fail until implemented.
// ---------------------------------------------------------------------------
import {
  parseHash,
  buildHash,
  THEMES,
  getDefaultTheme,
  getMode,
  fitText,
} from '../src/lib.js';

// ---------------------------------------------------------------------------
// Helper: compute WCAG relative luminance
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
// 5.1 URL Parsing Tests
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
    expect(buildHash('Jane', 'taxi-yellow')).toBe('#name=Jane&theme=taxi-yellow');
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
    { name: 'Dr. Muhammad Al-Rashid', theme: 'airport-blue' },
    { name: 'Émilie Dupont', theme: null },
    { name: "O'Brien Family", theme: 'sunset' },
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
// 5.2 Theme Tests
// ===========================================================================
describe('THEMES', () => {
  it('is a non-empty object', () => {
    expect(Object.keys(THEMES).length).toBeGreaterThan(0);
  });

  it('each theme has bg and text hex colors', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const [slug, theme] of Object.entries(THEMES)) {
      expect(theme.bg, `${slug}.bg`).toMatch(hexPattern);
      expect(theme.text, `${slug}.text`).toMatch(hexPattern);
    }
  });

  it('includes the six required themes', () => {
    const required = ['classic', 'inverted', 'airport-blue', 'taxi-yellow', 'terminal-green', 'sunset'];
    for (const slug of required) {
      expect(THEMES).toHaveProperty(slug);
    }
  });

  it('all themes pass WCAG AAA contrast (7:1)', () => {
    for (const [slug, theme] of Object.entries(THEMES)) {
      const ratio = contrastRatio(theme.bg, theme.text);
      expect(ratio, `${slug} contrast ratio ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(7);
    }
  });
});

describe('getDefaultTheme', () => {
  it('returns "chauffeur" when no localStorage value', () => {
    localStorage.clear();
    expect(getDefaultTheme()).toBe('chauffeur');
  });

  it('returns localStorage value when set', () => {
    localStorage.setItem('nameboard-theme', 'sunset');
    expect(getDefaultTheme()).toBe('sunset');
    localStorage.clear();
  });

  it('returns "chauffeur" for invalid localStorage value', () => {
    localStorage.setItem('nameboard-theme', 'nonexistent');
    expect(getDefaultTheme()).toBe('chauffeur');
    localStorage.clear();
  });
});

// ===========================================================================
// 5.3 Mode Determination Tests
// ===========================================================================
describe('getMode', () => {
  it('returns "input" when name is null (landscape)', () => {
    expect(getMode({ name: null }, 'landscape')).toBe('input');
  });

  it('returns "input" when name is null (portrait)', () => {
    expect(getMode({ name: null }, 'portrait')).toBe('input');
  });

  it('returns "display" when name is set and landscape', () => {
    expect(getMode({ name: 'Alice' }, 'landscape')).toBe('display');
  });

  it('returns "edit" when name is set and portrait', () => {
    expect(getMode({ name: 'Alice' }, 'portrait')).toBe('edit');
  });

  it('returns "input" when name is empty string', () => {
    expect(getMode({ name: '' }, 'landscape')).toBe('input');
  });

  it('treats unknown orientation as landscape (desktop)', () => {
    expect(getMode({ name: 'Alice' }, 'desktop')).toBe('display');
  });
});

// ===========================================================================
// 5.7 Font Sizing Tests
// ===========================================================================
describe('fitText', () => {
  let element;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
    document.body.appendChild(container);

    element = document.createElement('span');
    container.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('sets a font size greater than 0', () => {
    Object.defineProperty(element, 'scrollWidth', { value: 100, configurable: true });
    Object.defineProperty(element, 'scrollHeight', { value: 50, configurable: true });
    fitText(element, container);
    const size = parseInt(element.style.fontSize);
    expect(size).toBeGreaterThan(0);
  });

  it('uses binary search (max ~10 reflow iterations)', () => {
    let assignCount = 0;
    const originalDesc = Object.getOwnPropertyDescriptor(element.style, 'fontSize') || {};

    let currentFontSize = '';
    Object.defineProperty(element.style, 'fontSize', {
      get() { return currentFontSize; },
      set(val) {
        assignCount++;
        currentFontSize = val;
      },
      configurable: true,
    });
    Object.defineProperty(element, 'scrollWidth', { value: 200, configurable: true });
    Object.defineProperty(element, 'scrollHeight', { value: 100, configurable: true });

    fitText(element, container);
    expect(assignCount).toBeLessThanOrEqual(10);
  });

  it('shrinks font for very long names', () => {
    Object.defineProperty(element, 'scrollWidth', { value: 2000, configurable: true });
    Object.defineProperty(element, 'scrollHeight', { value: 100, configurable: true });
    fitText(element, container);
    const size = parseInt(element.style.fontSize);
    expect(size).toBe(10);
  });
});

// ===========================================================================
// 5.8 Service Worker Tests
// ===========================================================================
describe('Service Worker (sw.js)', () => {
  let swContent;

  beforeEach(() => {
    try {
      swContent = readFileSync(resolve(__dirname, '../src/sw.js'), 'utf-8');
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

  it('pre-caches lib.js', () => {
    expect(swContent).toMatch(/lib\.js/);
  });

  it('pre-caches manifest.json', () => {
    expect(swContent).toMatch(/manifest\.json/);
  });
});

// ===========================================================================
// 5.9 PWA Manifest Tests
// ===========================================================================
describe('manifest.json', () => {
  let manifest;

  beforeEach(() => {
    try {
      const raw = readFileSync(resolve(__dirname, '../src/manifest.json'), 'utf-8');
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
});

// ===========================================================================
// 5.10 Clipboard / Copy Link Tests (integration, mocked)
// ===========================================================================
describe('Clipboard copy', () => {
  it('navigator.clipboard.writeText is callable', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    navigator.clipboard.writeText('https://example.com/#name=Test');
    expect(writeText).toHaveBeenCalledWith('https://example.com/#name=Test');
  });
});

// ===========================================================================
// 5.11 Accessibility Tests (checked against HTML once it exists)
// ===========================================================================
describe('Accessibility (HTML)', () => {
  let doc;

  beforeEach(() => {
    try {
      const html = readFileSync(resolve(__dirname, '../src/index.html'), 'utf-8');
      const parser = new DOMParser();
      doc = parser.parseFromString(html, 'text/html');
    } catch {
      doc = null;
    }
  });

  it('index.html exists', () => {
    expect(doc).not.toBeNull();
  });

  it('display text has role="heading" and aria-level="1"', () => {
    const heading = doc.querySelector('[role="heading"][aria-level="1"]');
    expect(heading).not.toBeNull();
  });

  it('input has a visible label', () => {
    const label = doc.querySelector('label[for]');
    expect(label).not.toBeNull();
    const input = doc.querySelector(`#${label.getAttribute('for')}`);
    expect(input).not.toBeNull();
  });

  it('has theme picker containers for dynamic buttons', () => {
    const pickers = doc.querySelectorAll('.theme-row');
    expect(pickers.length).toBeGreaterThan(0);
  });

  it('JS sets aria-label on theme buttons', () => {
    const html = readFileSync(resolve(__dirname, '../src/index.html'), 'utf-8');
    expect(html).toMatch(/aria-label/);
    expect(html).toMatch(/theme-btn/);
  });

  it('name display has outline:none to prevent focus rectangle', () => {
    const nameEl = doc.getElementById('name-display');
    expect(nameEl).not.toBeNull();
    const html = readFileSync(resolve(__dirname, '../src/index.html'), 'utf-8');
    expect(html).toMatch(/#name-display\s*\{[^}]*outline:\s*none/);
  });

  it('has a toast element for notifications', () => {
    const toastEl = doc.getElementById('toast');
    expect(toastEl).not.toBeNull();
  });
});

// ===========================================================================
// 5.12 Offline / Cache Tests (structural)
// ===========================================================================
describe('Offline cache structure', () => {
  it('service worker registers from index.html', () => {
    let html;
    try {
      html = readFileSync(resolve(__dirname, '../src/index.html'), 'utf-8');
    } catch {
      html = null;
    }
    expect(html).not.toBeNull();
    expect(html).toMatch(/serviceWorker/);
    expect(html).toMatch(/sw\.js/);
  });
});

// ===========================================================================
// 5.13 Wake Lock Tests (mocked)
// ===========================================================================
describe('Wake Lock', () => {
  it('does not throw when navigator.wakeLock is undefined', async () => {
    delete navigator.wakeLock;
    const { requestWakeLock } = await import('../src/lib.js');
    await expect(requestWakeLock()).resolves.not.toThrow();
  });

  it('calls navigator.wakeLock.request when available', async () => {
    const mockRelease = vi.fn();
    const mockWakeLock = {
      addEventListener: vi.fn(),
      release: mockRelease,
    };
    const request = vi.fn().mockResolvedValue(mockWakeLock);
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
    });

    const { requestWakeLock } = await import('../src/lib.js');
    await requestWakeLock();
    expect(request).toHaveBeenCalledWith('screen');

    delete navigator.wakeLock;
  });
});

// ===========================================================================
// 5.14 Fullscreen Tests (mocked)
// ===========================================================================
describe('Fullscreen', () => {
  it('enterFullscreen calls requestFullscreen', async () => {
    const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.documentElement.requestFullscreen = mockRequestFullscreen;

    const { enterFullscreen } = await import('../src/lib.js');
    enterFullscreen();
    expect(mockRequestFullscreen).toHaveBeenCalled();

    delete document.documentElement.requestFullscreen;
  });

  it('enterFullscreen falls back to webkitRequestFullscreen', async () => {
    delete document.documentElement.requestFullscreen;
    const mockWebkit = vi.fn().mockResolvedValue(undefined);
    document.documentElement.webkitRequestFullscreen = mockWebkit;

    const { enterFullscreen } = await import('../src/lib.js');
    enterFullscreen();
    expect(mockWebkit).toHaveBeenCalled();

    delete document.documentElement.webkitRequestFullscreen;
  });

  it('exitFullscreen calls document.exitFullscreen when in fullscreen', async () => {
    const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = mockExitFullscreen;
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    });

    const { exitFullscreen } = await import('../src/lib.js');
    exitFullscreen();
    expect(mockExitFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
    delete document.exitFullscreen;
  });

  it('exitFullscreen falls back to webkitExitFullscreen', async () => {
    delete document.exitFullscreen;
    const mockWebkitExit = vi.fn().mockResolvedValue(undefined);
    document.webkitExitFullscreen = mockWebkitExit;
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
    Object.defineProperty(document, 'webkitFullscreenElement', {
      value: document.documentElement,
      configurable: true,
    });

    const { exitFullscreen } = await import('../src/lib.js');
    exitFullscreen();
    expect(mockWebkitExit).toHaveBeenCalled();

    Object.defineProperty(document, 'webkitFullscreenElement', {
      value: null,
      configurable: true,
    });
    delete document.webkitExitFullscreen;
  });

  it('does not throw when Fullscreen API is unavailable', async () => {
    delete document.documentElement.requestFullscreen;
    delete document.documentElement.webkitRequestFullscreen;
    const { enterFullscreen } = await import('../src/lib.js');
    expect(() => enterFullscreen()).not.toThrow();
  });
});

// ===========================================================================
// 5.15 Orientation Detection Tests
// ===========================================================================
describe('getOrientation', () => {
  // We test the pure logic from lib.js — getOrientation takes optional overrides
  // for testability.

  it('is exported from lib.js', async () => {
    const mod = await import('../src/lib.js');
    expect(typeof mod.getOrientation).toBe('function');
  });
});
