import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// One half of the zero-hardcoded-text proof; the other half is the sentinel
// fixtures every section test renders. The interactive directory is scanned too,
// because the control labels were moved into site.ui precisely so those
// components would hold none. src/components/ui/ is excluded: it is generated
// shadcn output and carries no display copy of its own.
const DIRS = ['src/components/sections', 'src/components/interactive'];

// Empty states are the one kind of copy that cannot come from content, because
// they are what renders when the content is missing. Nothing else belongs here:
// a failure names the file that has literal copy, and the fix is to move it into
// JSON, not to widen this set.
const ALLOWED = new Set([
  'No purpose statements yet. Add items to purpose.json.',
  'No services yet. Add items to services.json.',
  'No projects yet. Add items to portfolio.json.',
  'No team members yet. Add members to team.json.',
  'No contact channels yet. Add channels to contact.json.',
]);

const files = DIRS.flatMap((dir) =>
  readdirSync(join(process.cwd(), dir))
    .filter((name) => name.endsWith('.tsx') && !name.includes('.test.'))
    .map((name) => join(dir, name)),
);

describe('components carry no display copy', () => {
  test('components were found to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(files)('%s', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    // Text sitting directly between JSX tags. Newlines are deliberately allowed
    // inside the span: prettier puts a text child on its own line, so a pattern
    // anchored to a single line sees almost nothing. It scanned clean here while
    // a literal "Get in touch" sat in the navbar. Braces and angle brackets stay
    // excluded, which is what keeps expressions and nested tags from matching.
    const between = source.match(/>[^<>{}]*[A-Za-z]{2,}[^<>{}]*</g) ?? [];
    const offenders = between
      .map((match) => match.slice(1, -1).trim())
      .filter((text) => text.length > 0 && !ALLOWED.has(text));
    expect(offenders).toEqual([]);
  });
});

// The regex above only sees text between tags, so a literal reaching the user
// through a prop would pass it unnoticed.
describe('components carry no literal aria-label or title', () => {
  test.each(files)('%s', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toMatch(/(aria-label|title|alt)="[^"]*[A-Za-z]{2,}[^"]*"/);
  });
});
