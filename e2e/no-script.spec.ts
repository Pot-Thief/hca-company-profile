import { expect, test } from '@playwright/test';

// Reported from a phone: only the hero and the footer appeared, and the menu
// would not open. Those are exactly the two blocks that are not wrapped in
// Reveal, and the menu is the one control that needs hydration — so the cause
// was never responsive layout, it was that the page hides six of its eight
// blocks until JavaScript runs and had no way back if it did not.
//
// `@media (scripting: enabled)` does not cover this. It means the browser
// permits scripts, not that ours arrived and ran. A blocked chunk, an
// extension, a dropped connection on a phone — any of them left a reader with
// a headline and a copyright line.
//
// The stylesheet ships from the same /_next/static/chunks/ folder as the
// JavaScript, so this route has to let .css through or it tests nothing: with
// no stylesheet at all every block is visible by default and the bug hides.
test('every section is readable when the javascript never arrives', async ({ page }) => {
  await page.route('**/_next/static/chunks/**', (route) =>
    route.request().url().endsWith('.css') ? route.continue() : route.abort(),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Proof the stylesheet did load, so a pass cannot come from an unstyled page.
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(250, 250, 250)');

  // Waits for the safety timer in layout.tsx rather than assuming a delay, so
  // this asserts the end state instead of racing it.
  await page.waitForFunction(
    () => !document.documentElement.hasAttribute('data-reveal-armed'),
    null,
    {
      timeout: 5000,
    },
  );

  // Asserted on opacity, not with toBeVisible(). Playwright treats an element
  // at opacity 0 as visible — it checks display, visibility and the box — so a
  // toBeVisible() version of this test passed against the very bug it was
  // written for.
  const faded = await page.evaluate(() =>
    ['about', 'purpose', 'services', 'portfolio', 'team', 'contact'].filter((id) => {
      const wrapper = document.getElementById(id)?.closest('[data-reveal]');
      return wrapper !== null && wrapper !== undefined && getComputedStyle(wrapper).opacity === '0';
    }),
  );
  expect(faded, 'these sections render but stay invisible without javascript').toEqual([]);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});
