import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';

// ===========================================================================
// Full user flow: Input → Display → Edit → Input
// ===========================================================================
describe('Full user flow', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('submits a name and switches to display screen', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    const button = screen.getByText('Display Name');

    await userEvent.type(input, 'Ana Rodriguez');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana Rodriguez');
    });
  });

  it('updates the URL hash after submission', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');

    await userEvent.type(input, 'TestName');
    fireEvent.click(screen.getByText('Display Name'));

    await waitFor(() => {
      expect(window.location.hash).toContain('name=TestName');
    });
  });

  it('rejects empty input submission', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.value).toBe('');

    fireEvent.click(screen.getByText('Display Name'));

    expect(screen.queryByRole('heading', { level: 1 })).not.toHaveTextContent(/.+/);
  });

  it('rejects whitespace-only input submission', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');

    await userEvent.type(input, '   ');
    fireEvent.click(screen.getByText('Display Name'));

    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading?.textContent?.trim() || '').toBe('');
  });

  it('trims leading/trailing spaces from submitted name', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');

    await userEvent.type(input, '  Ana  ');
    fireEvent.click(screen.getByText('Display Name'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana');
    });
  });

  it('can return to input screen via edit button', async () => {
    window.location.hash = '#name=TestPerson&theme=bolt-chauffeur';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('TestPerson');
    });

    const editBtn = screen.getByTitle('Edit name');
    fireEvent.click(editBtn);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('e.g. John Smith');
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('TestPerson');
    });
  });

  it('pre-fills input from URL hash on initial load', () => {
    window.location.hash = '#name=PreFilled';
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.value).toBe('PreFilled');
  });
});

// ===========================================================================
// Display Screen elements
// ===========================================================================
describe('Display screen content', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows "Hello" greeting text', () => {
    window.location.hash = '#name=Ana&theme=bolt-chauffeur';
    render(<App />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows Bolt Chauffeur branding on display', () => {
    window.location.hash = '#name=Ana&theme=bolt-chauffeur';
    render(<App />);
    const logos = screen.getAllByLabelText('Bolt Chauffeur logo');
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all toolbar buttons', () => {
    window.location.hash = '#name=Ana&theme=bolt-chauffeur';
    render(<App />);

    expect(screen.getByTitle('Copy link')).toBeInTheDocument();
    expect(screen.getByTitle('QR code')).toBeInTheDocument();
    expect(screen.getByTitle('Download')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle fullscreen')).toBeInTheDocument();
    expect(screen.getByTitle('Edit name')).toBeInTheDocument();
  });

  it('applies bolt-chauffeur theme background color', () => {
    window.location.hash = '#name=Ana&theme=bolt-chauffeur';
    const { container } = render(<App />);
    const display = container.querySelector('[style*="background-color"]');
    expect(display).toBeDefined();
  });
});

// ===========================================================================
// Input Screen elements
// ===========================================================================
describe('Input screen content', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('has Bolt Chauffeur logo', () => {
    render(<App />);
    const logos = screen.getAllByLabelText('Bolt Chauffeur logo');
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it('has a labeled text input', () => {
    render(<App />);
    const input = screen.getByLabelText('Passenger name');
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('input has autocapitalize=words for name entry', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.getAttribute('autocapitalize')).toBe('words');
  });

  it('input has autocomplete=off', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('input has spellcheck disabled', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('e.g. John Smith');
    expect(input.getAttribute('spellcheck')).toBe('false');
  });

  it('shows copy link button only when a name exists', () => {
    render(<App />);
    expect(screen.queryByText(/Copy Link/)).not.toBeInTheDocument();
  });

  it('shows install hint button', () => {
    render(<App />);
    expect(screen.getByText(/Install as app/i)).toBeInTheDocument();
  });

  it('install hint is collapsed by default', () => {
    render(<App />);
    expect(screen.queryByText(/iPad & iPhone/i)).not.toBeInTheDocument();
  });

  it('install hint expands on click', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Install as app/i));
    await waitFor(() => {
      expect(screen.getByText(/iPad & iPhone/i)).toBeInTheDocument();
      expect(screen.getByText(/Android tablet/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// Special character names through the full UI
// ===========================================================================
describe('International name support through UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const names = [
    { label: 'Arabic', name: 'محمد', hash: encodeURIComponent('محمد') },
    { label: 'Chinese', name: '张伟' },
    { label: 'Accented', name: 'José García' },
    { label: 'Apostrophe', name: "O'Brien" },
    { label: 'Hyphenated', name: 'Smith-Jones' },
    { label: 'Long name', name: 'Dr. Muhammad Abdul-Rahman Al-Rashid III' },
  ];

  names.forEach(({ label, name }) => {
    it(`displays ${label} name correctly via hash`, async () => {
      window.location.hash = `#name=${encodeURIComponent(name)}&theme=bolt-chauffeur`;
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(name);
      });
    });
  });
});
