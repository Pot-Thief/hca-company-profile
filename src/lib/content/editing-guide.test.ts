import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// docs/EDITING-CONTENT.md is the only instruction a non-technical editor gets,
// and it had drifted: roughly a third of the editable keys were missing from it,
// including the browser tab title, the social share image, the hero buttons and
// the footer. Nothing catches that by reading, because a guide looks complete
// when every section it does have is well written. This walks the shipped JSON
// and fails if a key that reaches the page is not named anywhere in the guide.
const GUIDE = readFileSync(join(process.cwd(), 'docs/EDITING-CONTENT.md'), 'utf8');
const DATA_DIR = join(process.cwd(), 'public/data');

// Paths are written the way an editor sees them: `nav[].href`, `items[].logo.src`.
function paths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.length > 0 ? paths(value[0], `${prefix}[]`) : [prefix];
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      paths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

const files = readdirSync(DATA_DIR).filter((name) => name.endsWith('.json'));

describe('the editing guide covers every editable key', () => {
  test('the content files were found to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(files)('%s', (file) => {
    const parsed: unknown = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
    const missing = paths(parsed).filter((path) => {
      // The ui.* labels are documented in a table of their own, by bare name,
      // because that reads better for an editor than eight dotted paths.
      const bare = path.startsWith('ui.') ? path.slice(3) : path;
      return !GUIDE.includes(path) && !GUIDE.includes(`\`${bare}\``);
    });
    expect(
      missing,
      `${file}: these keys reach the page but are not named in docs/EDITING-CONTENT.md — ` +
        `an editor has no way to learn they exist: ${missing.join(', ')}`,
    ).toEqual([]);
  });
});

describe('the editing guide is safe to copy from', () => {
  // The guide tells editors to validate their file at jsonlint, while its own
  // examples carried `// Sebelum` and `// Sesudah` inside the JSON blocks —
  // eighteen lines that JSON.parse rejects outright. Anyone following the guide
  // literally would have produced exactly the broken file it warns about.
  test('every json example actually parses as json', () => {
    const blocks = [...GUIDE.matchAll(/```json\n([\s\S]*?)```/g)].map((match) => match[1] ?? '');
    expect(blocks.length).toBeGreaterThan(0);

    const broken = blocks.filter((block) => {
      // Fragments show one or more `"key": value` lines rather than a whole
      // file, so they are wrapped before parsing.
      const body = block.trim();
      const candidate = body.startsWith('{') ? body : `{${body}}`;
      try {
        JSON.parse(candidate);
        return false;
      } catch {
        return true;
      }
    });
    expect(
      broken,
      `these json examples in the guide do not parse:\n${broken.join('\n---\n')}`,
    ).toEqual([]);
  });
});
