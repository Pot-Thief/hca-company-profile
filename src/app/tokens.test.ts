import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

const REQUIRED = [
  '--color-paper',
  '--color-mist',
  '--color-ash',
  '--color-graphite',
  '--color-ink',
  '--color-void',
  '--font-display',
  '--font-body',
  '--font-mono',
  '--duration-fast',
  '--duration-base',
  '--duration-slow',
  '--ease-out',
  '--ease-in-out',
  '--nav-h',
  '--space-section',
  '--space-gutter',
  '--tracking-label',
  '--container-measure',
  '--space-block',
];

describe('design tokens', () => {
  test.each(REQUIRED)('%s is defined', (token) => {
    expect(css).toContain(`${token}:`);
  });

  test('declares a reduced motion block', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });

  test('declares the scripting-enabled reveal baseline', () => {
    expect(css).toContain('scripting: enabled');
  });

  test('defines a focus-visible outline', () => {
    expect(css).toContain(':focus-visible');
  });

  test('clears the default radius scale', () => {
    expect(css).toContain('--radius-*: initial');
  });

  test('clears the default shadow scale', () => {
    expect(css).toContain('--shadow-*: initial');
  });

  test('clears the default blur scale', () => {
    expect(css).toContain('--blur-*: initial');
  });

  test('keeps a small radius for interactive surfaces', () => {
    expect(css).toContain('--radius-edge:');
  });

  // Zero, not a small tolerance: every channel must be equal, so no hue can
  // enter the palette at all. This is what catches a generated theme, such as
  // the one shadcn writes into this file, rather than only limiting how far
  // off-neutral it drifts.
  test('every colour is strictly neutral', () => {
    const hexes = css.match(/#[0-9a-fA-F]{6}/g) ?? [];
    expect(hexes.length).toBeGreaterThan(0);
    for (const hex of hexes) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBe(0);
    }
  });
});
