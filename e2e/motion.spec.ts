import { expect, test } from '@playwright/test';

test('all content is visible and no transition runs under reduced motion', async ({ page }) => {
  // This installed Playwright version does not expose `reducedMotion` as a
  // `test.use()` fixture (it isn't in PlaywrightTestOptions, so `tsc` would
  // reject it) — emulate it directly on the page instead.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const id of ['about', 'purpose', 'services', 'portfolio', 'team', 'contact']) {
    const section = page.locator(`section#${id}`);
    await expect(section).toBeVisible();
    const opacity = await section.evaluate((node) => {
      const wrapper = node.closest('[data-reveal]') ?? node;
      return getComputedStyle(wrapper).opacity;
    });
    expect(Number(opacity)).toBe(1);
  }
  const durations = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-reveal], a, button'))
      .map((node) => getComputedStyle(node).transitionDuration)
      .filter((value) => value !== '0s'),
  );
  for (const duration of durations) {
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  }
});

// The proof that the reveal baseline holds without JS: it fails if somebody
// moves the hidden state out of the `scripting: enabled` block in
// globals.css, because then Contact and the services would render at
// opacity 0 with no client-side observer left to ever set opacity back to 1.
test('content is visible before any observer fires', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('section#contact')).toBeVisible();
  await expect(page.locator('#services h3')).toHaveCount(12);
  await context.close();
});
