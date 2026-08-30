import { readFile, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

// e2e/fixtures/live/ is a snapshot copy of public/data/, made once when this
// spec was written. It will drift from the real content over time, and that
// is fine: every assertion below turns on the deliberately changed hero
// headline (LIVE_FIXTURE_HEADLINE), never on the rest of the snapshot's
// content staying in sync with public/data/.
const HERO = 'e2e/fixtures/live/hero.json';

test('content comes from the http source, not the build', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET === 'broken', 'live fixtures only');
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/LIVE_FIXTURE_HEADLINE/);
});

test('editing the source file changes the page with no rebuild', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET === 'broken', 'live fixtures only');
  const original = await readFile(HERO, 'utf8');
  try {
    await writeFile(HERO, original.replace('LIVE_FIXTURE_HEADLINE', 'EDITED_WITHOUT_REBUILD'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText(/EDITED_WITHOUT_REBUILD/);
  } finally {
    await writeFile(HERO, original);
  }
});

test('broken json still renders every section', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  for (const id of ['about', 'purpose', 'services', 'portfolio', 'team', 'contact']) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('body')).not.toHaveText('');
});

// services.json's `items` is the string "not an array". arrayOf() can only
// validate an actual array, so its own .catch() fires and items becomes [],
// which is what drives the empty-state copy below (see zod-helpers.ts).
test('a broken services array falls back to the empty state', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  await expect(page.getByText('No services yet. Add items to services.json.')).toBeVisible();
});

// hero.json's `headline` is the number 42. str() wraps the field in
// .default('').catch(() => ''), and a *present* wrong-typed value skips
// .default() and fails the inner z.string() parse, so .catch() returns the
// empty-string fallback — not the old headline, not "42". The rest of the
// hero (eyebrow, actions) is untouched because each field is validated and
// caught independently.
test('a mistyped hero headline blanks the headline but keeps the rest of hero', async ({
  page,
}) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  const hero = page.locator('main > section').first();
  await expect(page.locator('h1')).toHaveText('');
  await expect(hero.getByText('Lorem ipsum dolor', { exact: true })).toBeVisible();
});

// site.json is truncated mid-object, so JSON.parse throws before schema
// validation ever runs. loadSection's catch block returns schema.parse({})
// for the whole section, so nav (and everything else in site.json) reverts
// to its schema default of [] rather than keeping the six links from the
// last good fetch.
test('truncated site json empties the nav instead of keeping stale links', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  await expect(page.locator('header ul li a')).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).not.toContainText('Company Placeholder');
});

// contact.json has one channel with type "carrier-pigeon", which is not in
// channelTypeSchema's enum. arrayOf() validates items individually and drops
// only the ones that fail, so the six valid channels still render and the
// one bad channel (originally the "Phone" entry) is silently excluded rather
// than crashing the section or reviving old content.
test('an invalid contact channel type is dropped, valid channels remain', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  await expect(page.locator('#contact dl > div')).toHaveCount(6);
  await expect(page.locator('#contact')).not.toContainText('Phone');
  await expect(page.locator('#contact')).toContainText('Email');
});
