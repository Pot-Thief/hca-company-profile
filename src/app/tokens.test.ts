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

  test('contains no hue outside the grayscale palette', () => {
    const hexes = css.match(/#[0-9a-fA-F]{6}/g) ?? [];
    for (const hex of hexes) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(8);
    }
  });
});
