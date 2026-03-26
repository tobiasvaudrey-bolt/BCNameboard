import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { THEMES } from '../src/themes.js';

// ===========================================================================
// Manifest – Extended validation
// ===========================================================================
describe('manifest.json – Extended PWA validation', () => {
  let manifest;

  beforeEach(() => {
    const raw = readFileSync(resolve(__dirname, '../public/manifest.json'), 'utf-8');
    manifest = JSON.parse(raw);
  });

  it('has a short_name for home screen display', () => {
    expect(manifest.short_name).toBeDefined();
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
  });

  it('has a description', () => {
    expect(manifest.description).toBeDefined();
    expect(manifest.description.length).toBeGreaterThan(10);
  });

  it('display is standalone for full-screen PWA experience', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('orientation is "any" to support portrait and landscape', () => {
    expect(manifest.orientation).toBe('any');
  });

  it('start_url is defined', () => {
    expect(manifest.start_url).toBeDefined();
  });

  it('theme_color matches the bolt-chauffeur background', () => {
    expect(manifest.theme_color).toBe(THEMES['bolt-chauffeur'].bg);
  });

  it('background_color is defined for splash screen', () => {
    expect(manifest.background_color).toBeDefined();
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('has at least 2 icons', () => {
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('icons include a 192x192 size (required for PWA)', () => {
    const has192 = manifest.icons.some((i) => i.sizes === '192x192');
    expect(has192).toBe(true);
  });

  it('icons include a 512x512 size (required for PWA)', () => {
    const has512 = manifest.icons.some((i) => i.sizes === '512x512');
    expect(has512).toBe(true);
  });

  it('all icons have a src and type', () => {
    manifest.icons.forEach((icon) => {
      expect(icon.src).toBeDefined();
      expect(icon.type).toBeDefined();
    });
  });

  it('icons use SVG format for scalability', () => {
    manifest.icons.forEach((icon) => {
      expect(icon.type).toBe('image/svg+xml');
    });
  });
});

// ===========================================================================
// Service Worker – Extended validation
// ===========================================================================
describe('Service Worker – Extended validation', () => {
  let swContent;

  beforeEach(() => {
    swContent = readFileSync(resolve(__dirname, '../public/sw.js'), 'utf-8');
  });

  it('registers install event listener', () => {
    expect(swContent).toContain("addEventListener('install'");
  });

  it('registers activate event listener', () => {
    expect(swContent).toContain("addEventListener('activate'");
  });

  it('registers fetch event listener', () => {
    expect(swContent).toContain("addEventListener('fetch'");
  });

  it('uses skipWaiting for immediate activation', () => {
    expect(swContent).toContain('skipWaiting');
  });

  it('uses clients.claim for immediate control', () => {
    expect(swContent).toContain('clients.claim');
  });

  it('cleans up old caches on activation', () => {
    expect(swContent).toContain('caches.keys');
    expect(swContent).toContain('caches.delete');
  });

  it('pre-caches essential assets', () => {
    expect(swContent).toContain('index.html');
    expect(swContent).toContain('manifest.json');
  });

  it('caches network responses for offline use', () => {
    expect(swContent).toContain('cache.put');
  });

  it('has a versioned cache name', () => {
    const match = swContent.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/^nameboard-v\d+$/);
  });

  it('uses cache-first strategy (checks cache before network)', () => {
    expect(swContent).toContain('caches.match');
  });
});

// ===========================================================================
// index.html – Meta tags and PWA setup
// ===========================================================================
describe('index.html – PWA meta tags', () => {
  let html;

  beforeEach(() => {
    html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  });

  it('has a theme-color meta tag', () => {
    expect(html).toMatch(/<meta\s[^>]*name=["']theme-color["']/);
  });

  it('theme-color matches bolt-chauffeur background', () => {
    const match = html.match(/<meta\s[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/);
    expect(match).not.toBeNull();
    expect(match[1]).toBe(THEMES['bolt-chauffeur'].bg);
  });

  it('has a viewport meta tag', () => {
    expect(html).toMatch(/<meta\s[^>]*name=["']viewport["']/);
  });

  it('links to the manifest', () => {
    expect(html).toMatch(/<link\s[^>]*rel=["']manifest["']/);
  });

  it('loads Google Fonts (Inter and Caveat)', () => {
    expect(html).toContain('fonts.googleapis.com');
    expect(html).toContain('Inter');
    expect(html).toContain('Caveat');
  });

  it('loads the app entry point', () => {
    expect(html).toContain('src/main.jsx');
  });
});

// ===========================================================================
// Service Worker registration (in main.jsx)
// ===========================================================================
describe('Service Worker registration', () => {
  let mainContent;

  beforeEach(() => {
    mainContent = readFileSync(resolve(__dirname, '../src/main.jsx'), 'utf-8');
  });

  it('registers the service worker in main.jsx', () => {
    expect(mainContent).toContain('serviceWorker');
    expect(mainContent).toContain('sw.js');
  });

  it('checks for serviceWorker support before registering', () => {
    expect(mainContent).toContain("'serviceWorker' in navigator");
  });
});

// ===========================================================================
// Theme consistency across the app
// ===========================================================================
describe('Theme consistency', () => {
  let manifest;
  let html;

  beforeEach(() => {
    manifest = JSON.parse(readFileSync(resolve(__dirname, '../public/manifest.json'), 'utf-8'));
    html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  });

  it('manifest theme_color matches HTML meta theme-color', () => {
    const match = html.match(/<meta\s[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/);
    expect(match).not.toBeNull();
    expect(manifest.theme_color).toBe(match[1]);
  });

  it('all theme colors in THEMES are valid hex', () => {
    const hex = /^#[0-9A-Fa-f]{6}$/;
    Object.values(THEMES).forEach((theme) => {
      expect(theme.bg).toMatch(hex);
      expect(theme.text).toMatch(hex);
      expect(theme.accent).toMatch(hex);
    });
  });
});
