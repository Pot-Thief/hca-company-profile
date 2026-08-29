import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// Components read the semantic layer — bg-surface, text-on-surface,
// text-on-surface-muted, border-rule, bg-signal, text-signal — and never name a
// palette colour, so a section flips its whole colour set from one attribute.
// Stating that in prose let the navbar and the mobile menu name palette colours
// in six places for the life of the project, invisibly, because the rendered
// result happened to be right. It only stayed right while those two components
// never sat on an ink surface. This scans instead.

const COMPONENT_DIRS = ['src/components/sections', 'src/components/interactive'];
const PALETTE = ['paper', 'mist', 'ash', 'graphite', 'ink', 'void'];

// Anchored on a utility prefix so `data-surface="ink"` and prose mentioning ink
// do not match — only a class that paints with a palette colour does.
const UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'decoration',
  'divide',
  'outline',
  'ring',
  'fill',
  'stroke',
  'accent',
  'caret',
  'placeholder',
  'shadow',
  'from',
  'via',
  'to',
];

const PALETTE_UTILITY = new RegExp(
  `\\b(?:${UTILITY_PREFIXES.join('|')})-(?:${PALETTE.join('|')})\\b`,
  'g',
);

// The one documented exception: this darkens a photograph, not a section
// surface, so it is tied to ink by intent rather than reaching past the layer.
const ALLOWED = new Map([['src/components/sections/Hero.tsx', ['bg-ink']]]);

function componentFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => join(dir, name));
}

const files = COMPONENT_DIRS.flatMap(componentFiles);

describe('semantic colour convention', () => {
  test('components were found to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(files)('%s paints only through the semantic layer', (file) => {
    const found = readFileSync(file, 'utf8').match(PALETTE_UTILITY) ?? [];
    const allowed = ALLOWED.get(file) ?? [];
    const violations = [...new Set(found)].filter((name) => !allowed.includes(name));
    expect(
      violations,
      `${file} names palette colours directly: ${violations.join(', ')}. Use bg-surface, ` +
        `text-on-surface, text-on-surface-muted, border-rule, bg-signal or text-signal so the ` +
        `component follows whatever surface it sits on.`,
    ).toEqual([]);
  });
});
