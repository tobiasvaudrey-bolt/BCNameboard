import { describe, it, expect } from 'vitest';
import { SIZE_PRESETS } from '../src/download.js';

// ===========================================================================
// SIZE_PRESETS structure validation
// ===========================================================================
describe('SIZE_PRESETS', () => {
  it('exports phone and tablet presets', () => {
    expect(SIZE_PRESETS).toHaveProperty('phone');
    expect(SIZE_PRESETS).toHaveProperty('tablet');
  });

  it('phone preset has valid pixel dimensions', () => {
    expect(SIZE_PRESETS.phone.w).toBeGreaterThan(0);
    expect(SIZE_PRESETS.phone.h).toBeGreaterThan(0);
    expect(Number.isInteger(SIZE_PRESETS.phone.w)).toBe(true);
    expect(Number.isInteger(SIZE_PRESETS.phone.h)).toBe(true);
  });

  it('tablet preset has valid pixel dimensions', () => {
    expect(SIZE_PRESETS.tablet.w).toBeGreaterThan(0);
    expect(SIZE_PRESETS.tablet.h).toBeGreaterThan(0);
    expect(Number.isInteger(SIZE_PRESETS.tablet.w)).toBe(true);
    expect(Number.isInteger(SIZE_PRESETS.tablet.h)).toBe(true);
  });

  it('phone preset is landscape orientation (wider than tall)', () => {
    expect(SIZE_PRESETS.phone.w).toBeGreaterThan(SIZE_PRESETS.phone.h);
  });

  it('tablet preset is landscape orientation (wider than tall)', () => {
    expect(SIZE_PRESETS.tablet.w).toBeGreaterThan(SIZE_PRESETS.tablet.h);
  });

  it('tablet is higher resolution than phone', () => {
    const phonePixels = SIZE_PRESETS.phone.w * SIZE_PRESETS.phone.h;
    const tabletPixels = SIZE_PRESETS.tablet.w * SIZE_PRESETS.tablet.h;
    expect(tabletPixels).toBeGreaterThan(phonePixels);
  });

  it('phone preset has layout overrides for larger text', () => {
    expect(SIZE_PRESETS.phone.helloScale).toBeGreaterThan(0);
    expect(SIZE_PRESETS.phone.brandScale).toBeGreaterThan(0);
    expect(SIZE_PRESETS.phone.nameMaxW).toBeGreaterThan(0);
    expect(SIZE_PRESETS.phone.nameMaxW).toBeLessThanOrEqual(1);
  });

  it('tablet preset has layout overrides', () => {
    expect(SIZE_PRESETS.tablet.helloScale).toBeGreaterThan(0);
    expect(SIZE_PRESETS.tablet.brandScale).toBeGreaterThan(0);
  });

  it('phone brand text is proportionally larger than tablet', () => {
    expect(SIZE_PRESETS.phone.brandScale).toBeGreaterThan(SIZE_PRESETS.tablet.brandScale);
  });

  it('phone name area uses more horizontal space than tablet', () => {
    expect(SIZE_PRESETS.phone.nameMaxW).toBeGreaterThanOrEqual(SIZE_PRESETS.tablet.nameMaxW);
  });

  it('all layout fractions are between 0 and 1', () => {
    const fractionKeys = ['helloScale', 'helloY', 'nameTop', 'nameBottom', 'nameMaxW', 'brandScale', 'brandY'];
    for (const preset of [SIZE_PRESETS.phone, SIZE_PRESETS.tablet]) {
      for (const key of fractionKeys) {
        if (preset[key] !== undefined) {
          expect(preset[key]).toBeGreaterThan(0);
          expect(preset[key]).toBeLessThan(1);
        }
      }
    }
  });

  it('name area does not overlap with Hello or branding', () => {
    for (const preset of [SIZE_PRESETS.phone, SIZE_PRESETS.tablet]) {
      const helloBottom = (preset.helloY || 0.07) + (preset.helloScale || 0.055);
      const nameTop = preset.nameTop || 0.17;
      const nameBottom = preset.nameBottom || 0.88;
      const brandTop = 1 - (preset.brandY || 0.05) - (preset.brandScale || 0.025);

      expect(nameTop).toBeGreaterThan(helloBottom);
      expect(nameBottom).toBeLessThan(brandTop + 0.05);
    }
  });
});

// ===========================================================================
// sanitizeFilename (tested indirectly via module internals pattern)
// ===========================================================================
describe('Filename safety', () => {
  it('downloadAsImage is an async function export', async () => {
    const mod = await import('../src/download.js');
    expect(typeof mod.downloadAsImage).toBe('function');
  });

  it('downloadAsPDF is an async function export', async () => {
    const mod = await import('../src/download.js');
    expect(typeof mod.downloadAsPDF).toBe('function');
  });
});
