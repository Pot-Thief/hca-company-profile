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

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});

// The two ink blocks get their own scans. A whole-page run does reach them —
// Reveal only changes opacity, it never conditionally renders — but "did axe
// look here" is worth proving rather than assuming, because the contrast risk
// on this site lives in the dark blocks and a scan that quietly stopped at the
// fold would still report clean.
//
// The first version of this proof searched the whole-page result for selector
// strings containing "#contact" and "footer". That passed for the wrong reason:
// axe names each node by the shortest selector that identifies it, so the match
// depended on which elements happened to be there, and it broke the moment an
// unrelated decorative element was removed from the footer. Scoping the scan is
// the direct proof: axe is told to analyse exactly this region, so a non-empty
// result set can only mean it did.
for (const region of ['#contact', 'footer']) {
  test(`the ${region} ink block is analysed and clean`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include(region)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(
      results.passes.length + results.violations.length + results.incomplete.length,
      `axe returned no results for ${region}, so nothing was actually analysed`,
    ).toBeGreaterThan(0);

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });
}

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
