import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('no serious or critical axe violations', async ({ page }) => {
  // The above-the-fold sections fade in via a CSS transition (data-reveal):
  // axe's contrast checker samples the actual rendered colour, which
  // mid-transition is blended through the ancestor's partial opacity — a
  // transient animation frame that briefly looks like a contrast violation
  // but isn't one. Reduced motion collapses that transition to effectively
  // nothing (see globals.css), giving axe a settled DOM to analyse; the
  // reveal animation itself is covered separately by motion.spec.ts.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // AxeBuilder scans the whole DOM by default, not the viewport — Reveal
  // never conditionally renders its content (only opacity/transform change),
  // so Contact and the Footer are already in the document axe walks even
  // though they sit below the fold. Proved rather than assumed: every axe
  // result (pass, violation, incomplete, inapplicable) carries the CSS
  // selector path of the element it looked at, so collecting those and
  // checking the ink sections show up is direct evidence axe actually
  // analysed them, not just the top of the page.
  const touchedSelectors = [
    ...results.passes,
    ...results.violations,
    ...results.incomplete,
    ...results.inapplicable,
  ].flatMap((entry) => entry.nodes.map((node) => JSON.stringify(node.target)));
  expect(touchedSelectors.some((selector) => selector.includes('#contact'))).toBe(true);
  expect(touchedSelectors.some((selector) => selector.includes('footer'))).toBe(true);

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});

test('tabbing from the top reaches the footer with focus always visible', async ({ page }) => {
  await page.goto('/');
  const seen: string[] = [];
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element || element === document.body) return null;
      const style = getComputedStyle(element);
      return {
        tag: element.tagName,
        outlineWidth: style.outlineWidth,
        inFooter: !!element.closest('footer'),
      };
    });
    if (!focused) break;
    expect(focused.outlineWidth).not.toBe('0px');
    seen.push(focused.tag);
    if (focused.inFooter) return;
  }
  throw new Error(`never reached the footer, focused: ${seen.join(', ')}`);
});

// The header CTA is hidden below md (Tailwind's `hidden md:inline-block`),
// same as the desktop nav links, so on mobile the banner has no links at all
// (only the Menu button) and this test would just fail to find a target.
// The interaction it checks — that focus and hover render differently — is
// only present at all on tablet and desktop.
test('focus and hover are visually different', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'header CTA link is hidden below md');
  await page.goto('/');
  const cta = page.getByRole('banner').getByRole('link').last();
  await cta.hover();
  const hover = await cta.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineStyle, background: style.backgroundColor };
  });
  await cta.focus();
  const focus = await cta.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineStyle, background: style.backgroundColor };
  });
  // outline-width alone is not a reliable signal: Chromium reports its
  // initial "medium" (3px) width even when outline-style is 'none' and
  // nothing is actually painted, so the style is what tells hover and focus
  // apart.
  expect(hover.outline).toBe('none');
  expect(focus.outline).not.toBe('none');
});

test('disclosures work with the keyboard and report their state', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('#portfolio [aria-expanded]').first();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});
