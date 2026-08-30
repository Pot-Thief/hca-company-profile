import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.VISUAL, 'set VISUAL=1 to run visual regression');

const SECTIONS = ['about', 'purpose', 'services', 'portfolio', 'team', 'contact'];

// Settles the page before a screenshot is compared, so the baseline captures
// a cold, static render rather than a moment mid-transition:
// - reduced motion collapses the Reveal fade to nothing (globals.css's
//   prefers-reduced-motion block forces opacity: 1 unconditionally);
// - Portfolio and Team render their images through next/image without
//   `priority`, so they load lazily as the browser notices them near the
//   viewport — waiting for every `img` inside the captured element to report
//   `complete` avoids catching one mid-load;
// - clearing focus and moving the mouse off-canvas removes any hover/focus
//   state a previous action in the same test could have left behind.
async function settle(page: Page, selector: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction((sel) => {
    const root = document.querySelector(sel);
    if (!root) return false;
    return Array.from(root.querySelectorAll('img')).every(
      (img) => img.complete && img.naturalWidth > 0,
    );
  }, selector);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.mouse.move(0, 0);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('hero matches the baseline', async ({ page }) => {
  await settle(page, 'main > :first-child');
  await expect(page.locator('main > :first-child')).toHaveScreenshot('hero.png');
});

for (const id of SECTIONS) {
  test(`${id} matches the baseline`, async ({ page }) => {
    const section = page.locator(`section#${id}`);
    await section.scrollIntoViewIfNeeded();
    await settle(page, `section#${id}`);
    await expect(section).toHaveScreenshot(`${id}.png`);
  });
}
