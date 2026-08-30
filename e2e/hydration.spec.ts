import { expect, test } from '@playwright/test';

// A root-level hydration mismatch does not throw and does not fail a build. It
// prints a warning and quietly leaves client components inert, so the menu and
// both disclosures stopped opening while every other spec stayed green. This
// shipped once, caused by an inline script stamping an attribute onto <html>
// before React could compare its own tree against the server's.
//
// This spec deliberately does NOT watch the console for React's mismatch
// warning. That warning exists only in a development build, and these specs run
// against a production one, so an assertion on it passes no matter what — it was
// written that way first and proved it by staying green while the exact broken
// markup was put back. What runs here is the consequence a reader would feel:
// the controls still work. The cause is caught cheaply at source level instead,
// in src/app/no-document-mutation.test.ts.
test('every client control works after hydration', async ({ page }) => {
  const crashes: string[] = [];
  page.on('pageerror', (error) => crashes.push(error.message.slice(0, 200)));
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(crashes, 'the page threw while loading').toEqual([]);

  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  const row = page.locator('#portfolio button').first();
  await row.click();
  await expect(row).toHaveAttribute('aria-expanded', 'true');

  await page.locator('#team').scrollIntoViewIfNeeded();
  const bio = page.locator('#team button').first();
  await bio.click();
  await expect(bio).toHaveAttribute('aria-expanded', 'true');
});

test('the mobile menu opens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the sheet only exists below md');
  await page.goto('/');
  await page.getByRole('button', { name: /menu/i }).first().click();
  await expect(page.locator('[role="dialog"] a').first()).toBeVisible();
});
