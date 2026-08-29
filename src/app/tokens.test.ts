import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

// The palette is written as hex on purpose, so any colour function here is
// either a generated theme or a hue arriving by another notation. Checking
// hex alone missed shadcn's oklch variables entirely in Task 14.
const COLOUR_FUNCTIONS = /\b(oklch|oklab|lab|lch|hsla?|rgba?|color)\s*\(/;

const UI_DIR = join(process.cwd(), 'src/components/ui');
const uiFiles = readdirSync(UI_DIR).filter((name) => name.endsWith('.tsx'));

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
  '--container-page',
  '--space-block',
  '--leading-display',
  '--leading-heading',
  '--leading-body',
  '--tracking-display',
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-muted',
  '--color-rule',
];

// The four semantic colours are the layer every section reads. They once
// shipped with an alias in between, declared at :root, which froze the value at
// the root and made the inverted sections render ink text on ink. The variables
// read correctly while the rendered colour did not, and jsdom cannot resolve the
// cascade, so these are source-text assertions rather than render assertions.
const SEMANTIC_COLOURS = [
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-muted',
  '--color-rule',
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

  test('declares no colour in a notation that can carry hue', () => {
    expect(css).not.toMatch(COLOUR_FUNCTIONS);
  });

  test('the ink surface overrides every semantic colour, not a subset', () => {
    const block = css.match(/\[data-surface='ink'\]\s*\{([^}]*)\}/);
    expect(block).not.toBeNull();
    for (const name of SEMANTIC_COLOURS) {
      expect(block?.[1]).toContain(`${name}:`);
    }
  });

  test('no alias layer stands between the tokens and their consumers', () => {
    for (const alias of ['--surface:', '--on-surface:', '--on-surface-muted:', '--rule:']) {
      expect(css).not.toContain(alias);
    }
  });
});

// Generated shadcn components are the one place a colour can arrive without
// passing through globals.css, so they are held to the same rule.
describe('generated ui components carry no colour of their own', () => {
  test('the directory is not empty, so these assertions mean something', () => {
    expect(uiFiles.length).toBeGreaterThan(0);
  });

  test.each(uiFiles)('%s uses no colour function', (file) => {
    expect(readFileSync(join(UI_DIR, file), 'utf8')).not.toMatch(COLOUR_FUNCTIONS);
  });

  test.each(uiFiles)('%s uses no raw hex', (file) => {
    expect(readFileSync(join(UI_DIR, file), 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  test.each(uiFiles)('%s does not suppress the global focus outline', (file) => {
    const source = readFileSync(join(UI_DIR, file), 'utf8');
    expect(source).not.toContain('outline-none');
    expect(source).not.toContain('focus-visible:ring');
  });
});
