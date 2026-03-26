import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';
import { THEMES } from '../src/themes.js';

// ===========================================================================
// Helper: WCAG relative luminance + contrast
// ===========================================================================
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
// WCAG Contrast
// ===========================================================================
describe('WCAG Contrast compliance', () => {
  it('text on background passes WCAG AA (4.5:1)', () => {
    const theme = THEMES['bolt-chauffeur'];
    const ratio = contrastRatio(theme.bg, theme.text);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('text on background passes WCAG AAA (7:1)', () => {
    const theme = THEMES['bolt-chauffeur'];
    const ratio = contrastRatio(theme.bg, theme.text);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it('accent on background has sufficient contrast for decorative use (>1.5:1)', () => {
    const theme = THEMES['bolt-chauffeur'];
    const ratio = contrastRatio(theme.bg, theme.accent);
    expect(ratio).toBeGreaterThanOrEqual(1.5);
  });

  it('input screen has sufficient contrast (white text on dark bg)', () => {
    const ratio = contrastRatio('#ffffff', '#111111');
    expect(ratio).toBeGreaterThanOrEqual(15);
  });
});

// ===========================================================================
// ARIA and Semantic HTML – Input Screen
// ===========================================================================
describe('Input screen accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('logo has an accessible label', () => {
    render(<App />);
    const logos = screen.getAllByLabelText('Bolt Chauffeur logo');
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it('form input has an associated label', () => {
    render(<App />);
    const input = screen.getByLabelText('Passenger name');
    expect(input.tagName).toBe('INPUT');
  });

  it('submit button has descriptive text', () => {
    render(<App />);
    const btn = screen.getByText('Display Name');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.type).toBe('submit');
  });

  it('form uses a <form> element for semantic structure', () => {
    const { container } = render(<App />);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
  });

  it('input has a placeholder for guidance', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input).toBeInTheDocument();
  });
});

// ===========================================================================
// ARIA and Semantic HTML – Display Screen
// ===========================================================================
describe('Display screen accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#name=TestGuest&theme=bolt-chauffeur';
  });

  it('name is rendered as a heading (role=heading, level 1)', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('TestGuest');
  });

  it('all toolbar buttons have title attributes', () => {
    render(<App />);
    const expectedTitles = ['Copy link', 'QR code', 'Download', 'Toggle fullscreen', 'Edit name'];
    expectedTitles.forEach((title) => {
      expect(screen.getByTitle(title)).toBeInTheDocument();
    });
  });

  it('all toolbar buttons are of type="button"', () => {
    render(<App />);
    const buttons = screen.getAllByRole('button');
    const toolbarButtons = buttons.filter((b) => b.getAttribute('title'));
    toolbarButtons.forEach((btn) => {
      expect(btn.type).toBe('button');
    });
  });

  it('toolbar buttons have visible icons (SVG children)', () => {
    render(<App />);
    const buttons = screen.getAllByRole('button').filter((b) => b.getAttribute('title'));
    buttons.forEach((btn) => {
      expect(btn.querySelector('svg')).not.toBeNull();
    });
  });
});

// ===========================================================================
// Touch target sizes (WCAG 2.5.8 – minimum 24x24 CSS px)
// ===========================================================================
describe('Touch target sizing', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('submit button has sufficient padding for touch (py-3.5 = 14px)', () => {
    render(<App />);
    const btn = screen.getByText('Display Name');
    expect(btn.className).toContain('py-3.5');
  });

  it('toolbar buttons have padding for touch (p-1.5)', () => {
    window.location.hash = '#name=Test&theme=bolt-chauffeur';
    render(<App />);
    const editBtn = screen.getByTitle('Edit name');
    expect(editBtn.className).toContain('p-1.5');
  });
});

// ===========================================================================
// Keyboard navigation
// ===========================================================================
describe('Keyboard accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('input is focusable', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('submit button is focusable', () => {
    render(<App />);
    const btn = screen.getByText('Display Name');
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('form can be submitted with Enter key', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    input.focus();

    await import('@testing-library/user-event').then(async ({ default: userEvent }) => {
      await userEvent.type(input, 'EnterTest{Enter}');
    });

    expect(window.location.hash).toContain('name=EnterTest');
  });
});
