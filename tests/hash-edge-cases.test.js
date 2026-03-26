import { describe, it, expect } from 'vitest';
import { parseHash, buildHash } from '../src/hash.js';

// ===========================================================================
// Security: XSS / Injection Vectors
// ===========================================================================
describe('parseHash – XSS and injection resistance', () => {
  const xssVectors = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert('xss')",
    '<svg onload=alert(1)>',
    '{{constructor.constructor("return this")()}}',
    '${7*7}',
    "'; DROP TABLE users; --",
    'UNION SELECT * FROM passwords',
  ];

  xssVectors.forEach((vector) => {
    it(`round-trips XSS vector without execution: ${vector.slice(0, 40)}…`, () => {
      const hash = buildHash(vector, 'bolt-chauffeur');
      const parsed = parseHash(hash);
      expect(parsed.name).toBe(vector);
      expect(typeof parsed.name).toBe('string');
    });
  });
});

// ===========================================================================
// Unicode: Global name support
// ===========================================================================
describe('parseHash – International names', () => {
  const internationalNames = [
    { label: 'Arabic', name: 'محمد بن سلمان' },
    { label: 'Chinese', name: '张伟' },
    { label: 'Japanese', name: '田中太郎' },
    { label: 'Korean', name: '김민수' },
    { label: 'Cyrillic', name: 'Борис Петров' },
    { label: 'Hindi', name: 'राजेश कुमार' },
    { label: 'Thai', name: 'สมชาย' },
    { label: 'Hebrew', name: 'דוד כהן' },
    { label: 'Emoji in name', name: '👋 Welcome' },
    { label: 'Accented Latin', name: 'José García Müller' },
    { label: 'Turkish', name: 'İbrahim Öztürk' },
    { label: 'Vietnamese', name: 'Nguyễn Văn An' },
    { label: 'Greek', name: 'Γιώργος Παπαδόπουλος' },
  ];

  internationalNames.forEach(({ label, name }) => {
    it(`round-trips ${label} name: ${name}`, () => {
      const hash = buildHash(name, 'bolt-chauffeur');
      const parsed = parseHash(hash);
      expect(parsed.name).toBe(name);
    });
  });
});

// ===========================================================================
// Boundary conditions
// ===========================================================================
describe('parseHash – Boundary conditions', () => {
  it('handles a 500-character name', () => {
    const longName = 'A'.repeat(500);
    const hash = buildHash(longName, 'bolt-chauffeur');
    const parsed = parseHash(hash);
    expect(parsed.name).toBe(longName);
    expect(parsed.name.length).toBe(500);
  });

  it('handles a single character name', () => {
    const parsed = parseHash(buildHash('A', null));
    expect(parsed.name).toBe('A');
  });

  it('handles name with only spaces', () => {
    const hash = buildHash('   ', null);
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('   ');
  });

  it('handles name with leading/trailing whitespace', () => {
    const hash = buildHash('  John Smith  ', null);
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('  John Smith  ');
  });

  it('handles name with multiple consecutive spaces', () => {
    const hash = buildHash('John    Smith', null);
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('John    Smith');
  });

  it('handles name with newline characters', () => {
    const hash = buildHash('John\nSmith', null);
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('John\nSmith');
  });

  it('handles name with tab characters', () => {
    const hash = buildHash('John\tSmith', null);
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('John\tSmith');
  });
});

// ===========================================================================
// URL-unsafe characters
// ===========================================================================
describe('parseHash – URL-unsafe characters', () => {
  const urlUnsafe = [
    { label: 'ampersand', name: 'Smith & Sons' },
    { label: 'equals', name: 'A=B' },
    { label: 'hash', name: 'Room #5' },
    { label: 'question mark', name: 'Who?' },
    { label: 'slash', name: 'Floor 3/4' },
    { label: 'percent', name: '100% VIP' },
    { label: 'plus sign', name: 'Mr+Mrs Smith' },
    { label: 'double quotes', name: '"VIP" Guest' },
    { label: 'single quotes', name: "O'Connor" },
    { label: 'backticks', name: '`John`' },
    { label: 'brackets', name: '[Smith] (VIP)' },
    { label: 'pipe', name: 'Smith | Jones' },
  ];

  urlUnsafe.forEach(({ label, name }) => {
    it(`round-trips name with ${label}`, () => {
      const hash = buildHash(name, null);
      const parsed = parseHash(hash);
      expect(parsed.name).toBe(name);
    });
  });
});

// ===========================================================================
// Malformed hash inputs (defensive parsing)
// ===========================================================================
describe('parseHash – Malformed inputs', () => {
  it('handles hash with no equals sign', () => {
    const result = parseHash('#justtext');
    expect(result.name).toBeNull();
  });

  it('handles hash with extra hash symbols', () => {
    const result = parseHash('##name=Test');
    expect(result).toBeDefined();
  });

  it('handles hash with duplicate name params', () => {
    const result = parseHash('#name=First&name=Second');
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe('string');
  });

  it('handles completely empty hash', () => {
    expect(parseHash('#')).toEqual({ name: null, theme: null });
  });

  it('handles hash with only theme (no name)', () => {
    const result = parseHash('#theme=bolt-chauffeur');
    expect(result.name).toBeNull();
    expect(result.theme).toBe('bolt-chauffeur');
  });
});

// ===========================================================================
// buildHash edge cases
// ===========================================================================
describe('buildHash – Edge cases', () => {
  it('returns just # for empty string name', () => {
    const hash = buildHash('', null);
    expect(hash).toBe('#');
  });

  it('returns just # for undefined name', () => {
    const hash = buildHash(undefined, undefined);
    expect(hash).toBe('#');
  });

  it('encodes name with unicode properly', () => {
    const hash = buildHash('Ñoño', null);
    expect(hash).toContain('name=');
    const parsed = parseHash(hash);
    expect(parsed.name).toBe('Ñoño');
  });
});
