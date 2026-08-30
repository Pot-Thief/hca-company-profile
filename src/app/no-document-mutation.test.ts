import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// React hydrates <html> and <body> in the App Router, comparing the server's
// markup against its own tree. Anything that edits those elements before
// hydration is a mismatch, and a root mismatch is not loud: it warns only in a
// development build, then quietly leaves every client component inert. That
// shipped once — an inline script in the layout stamped an attribute onto
// <html> to arm a CSS animation, and the mobile menu and both disclosures
// stopped opening while the whole suite stayed green.
//
// It cannot be caught by an end-to-end console watch, because the warning does
// not exist in the production build those specs run against. It is cheap to
// catch here.
const LAYOUT = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');

describe('the layout does not touch the document before React does', () => {
  test('injects no inline script', () => {
    expect(
      LAYOUT,
      'an inline script in the layout runs before hydration; if it edits <html> or ' +
        '<body> React reports a mismatch and client components stop working',
    ).not.toContain('dangerouslySetInnerHTML');
  });

  test.each(['documentElement', 'document.body'])('does not reach for %s', (target) => {
    expect(LAYOUT).not.toContain(target);
  });
});
