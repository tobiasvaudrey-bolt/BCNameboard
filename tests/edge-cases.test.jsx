import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { THEMES, DEFAULT_THEME, resolveTheme, getSavedTheme, saveTheme, applyThemeToDOM } from '../src/themes.js';
import { parseHash, buildHash } from '../src/hash.js';

// ===========================================================================
// Theme resilience
// ===========================================================================
describe('Theme resilience', () => {
  beforeEach(() => localStorage.clear());

  it('resolveTheme never returns undefined', () => {
    const inputs = [null, undefined, '', 'fake', 123, true, {}, [], 'bolt-chauffeur'];
    inputs.forEach((input) => {
      const result = resolveTheme(input);
      expect(result).toBeDefined();
      expect(THEMES[result]).toBeDefined();
    });
  });

  it('getSavedTheme handles corrupted localStorage gracefully', () => {
    localStorage.setItem('nameboard-theme', '💥');
    expect(getSavedTheme()).toBe(DEFAULT_THEME);
  });

  it('saveTheme does not throw for any value', () => {
    expect(() => saveTheme('bolt-chauffeur')).not.toThrow();
    expect(() => saveTheme('')).not.toThrow();
    expect(() => saveTheme(null)).not.toThrow();
  });

  it('applyThemeToDOM sets CSS custom properties', () => {
    applyThemeToDOM('bolt-chauffeur');
    const bg = document.documentElement.style.getPropertyValue('--theme-bg');
    const text = document.documentElement.style.getPropertyValue('--theme-text');
    expect(bg).toBe(THEMES['bolt-chauffeur'].bg);
    expect(text).toBe(THEMES['bolt-chauffeur'].text);
  });

  it('applyThemeToDOM falls back to default for invalid slug', () => {
    applyThemeToDOM('nonexistent');
    const bg = document.documentElement.style.getPropertyValue('--theme-bg');
    expect(bg).toBe(THEMES[DEFAULT_THEME].bg);
  });
});

// ===========================================================================
// Extreme name lengths through the UI
// ===========================================================================
describe('Extreme name lengths', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('handles a very long name (200 characters) via hash', async () => {
    const longName = 'Abcdefghij '.repeat(20).trim();
    window.location.hash = `#name=${encodeURIComponent(longName)}&theme=bolt-chauffeur`;
    render(<App />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toBe(longName);
    });
  });

  it('handles a single character name via hash', async () => {
    window.location.hash = '#name=X&theme=bolt-chauffeur';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('X');
    });
  });

  it('handles a name with many words via hash', async () => {
    const name = 'Dr Sir Professor John James William Edward Smith III Esquire';
    window.location.hash = `#name=${encodeURIComponent(name)}&theme=bolt-chauffeur`;
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(name);
    });
  });
});

// ===========================================================================
// Hash parameter manipulation
// ===========================================================================
describe('Hash parameter edge cases', () => {
  it('extra unknown parameters are ignored', () => {
    const result = parseHash('#name=Test&theme=bolt-chauffeur&evil=true&admin=1');
    expect(result.name).toBe('Test');
    expect(result.theme).toBe('bolt-chauffeur');
  });

  it('handles hash with only unknown parameters', () => {
    const result = parseHash('#foo=bar&baz=qux');
    expect(result.name).toBeNull();
    expect(result.theme).toBeNull();
  });

  it('handles extremely long hash string', () => {
    const longName = 'A'.repeat(2000);
    const hash = buildHash(longName, 'bolt-chauffeur');
    const result = parseHash(hash);
    expect(result.name).toBe(longName);
  });
});

// ===========================================================================
// Rapid interactions (debounce / race conditions)
// ===========================================================================
describe('Rapid interactions', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('handles rapid form submissions without crashing', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    const button = screen.getByText('Display Name');

    for (let i = 0; i < 5; i++) {
      await userEvent.clear(input);
      await userEvent.type(input, `Name${i}`);
      fireEvent.click(button);
    }

    expect(window.location.hash).toContain('name=');
  });

  it('handles rapid hash changes without crashing', async () => {
    render(<App />);
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

    names.forEach((name) => {
      window.location.hash = `#name=${name}&theme=bolt-chauffeur`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eve');
    });
  });
});

// ===========================================================================
// CSS / Layout – Defensive checks
// ===========================================================================
describe('Layout defensive checks', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('input screen container allows scrolling (overflow-y-auto)', () => {
    render(<App />);
    const container = screen.getByPlaceholderText('e.g. John Smith').closest('[class*="overflow-y-auto"]');
    expect(container).not.toBeNull();
  });

  it('input screen does NOT use justify-center (landscape scroll bug)', () => {
    render(<App />);
    const container = screen.getByPlaceholderText('e.g. John Smith').closest('[class*="absolute"]');
    expect(container.className).not.toContain('justify-center');
  });

  it('display screen uses overflow-hidden (no scroll on nameboard)', () => {
    window.location.hash = '#name=Test&theme=bolt-chauffeur';
    const { container } = render(<App />);
    const display = container.querySelector('[class*="overflow-hidden"]');
    expect(display).not.toBeNull();
  });

  it('inner content wrapper uses my-auto for vertical centering', () => {
    render(<App />);
    const wrapper = screen.getByPlaceholderText('e.g. John Smith').closest('[class*="my-auto"]');
    expect(wrapper).not.toBeNull();
  });
});

// ===========================================================================
// QR overlay
// ===========================================================================
describe('QR code overlay', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('QR button exists on display screen', () => {
    window.location.hash = '#name=Test&theme=bolt-chauffeur';
    render(<App />);
    expect(screen.getByTitle('QR code')).toBeInTheDocument();
  });

  it('QR overlay appears when button is clicked', async () => {
    window.location.hash = '#name=Test&theme=bolt-chauffeur';
    render(<App />);

    fireEvent.click(screen.getByTitle('QR code'));

    await waitFor(() => {
      const scanTexts = screen.getAllByText('Scan to open on another device');
      expect(scanTexts.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ===========================================================================
// Copy link functionality
// ===========================================================================
describe('Copy link', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Copy link button exists on display screen toolbar', () => {
    window.location.hash = '#name=Test&theme=bolt-chauffeur';
    render(<App />);
    expect(screen.getByTitle('Copy link')).toBeInTheDocument();
  });

  it('Clipboard writeText is called when copy is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    window.location.hash = '#name=CopyTest&theme=bolt-chauffeur';
    render(<App />);

    fireEvent.click(screen.getByTitle('Copy link'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      const url = writeText.mock.calls[0][0];
      expect(url).toContain('name=CopyTest');
    });
  });
});
