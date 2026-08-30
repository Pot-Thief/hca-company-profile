import { expect, test } from '@playwright/test';

const SECTIONS = ['about', 'purpose', 'services', 'portfolio', 'team', 'contact'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the banner, main, contentinfo, and all six anchored sections', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  for (const id of SECTIONS) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
});

test('has exactly one h1 and no skipped heading levels', async ({ page }) => {
  await expect(page.locator('h1')).toHaveCount(1);
  const levels = await page
    .locator('h1, h2, h3')
    .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));
  levels.reduce((previous, current) => {
    expect(current - previous).toBeLessThanOrEqual(1);
    return current;
  }, levels[0] ?? 1);
});

test('renders the required item counts', async ({ page }) => {
  await expect(page.locator('#services h3')).toHaveCount(12);
  await expect(page.locator('#portfolio h3')).toHaveCount(6);
  await expect(page.locator('#team h3')).toHaveCount(2);
  await expect(page.locator('#purpose h3')).toHaveCount(4);
});

test('the page contains no form and no input', async ({ page }) => {
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
});

// Hero and Contact/Footer are the deliberate ink emphasis; About, Purpose,
// Services, Portfolio and Team are one continuous paper surface between them.
// This is a structural decision (SectionShell's `surface` prop, defaulted to
// 'paper') that carries no visible marker other than the data-surface
// attribute itself, so nothing else would catch it drifting back to an
// alternating pattern. Asserted as a full ordered sequence, not a count, so a
// swap between two sections (which a count could not see) still fails.
test('the surface sequence is ink, five paper, ink, ink in document order', async ({ page }) => {
  const surfaces = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('main > section, main > [data-reveal] > section, footer'),
    ).map((node) => node.getAttribute('data-surface') ?? 'paper'),
  );
  expect(surfaces).toEqual(['ink', 'paper', 'paper', 'paper', 'paper', 'paper', 'ink', 'ink']);
});

test('anchor navigation lands below the navbar', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: /menu/i }).click();
  }
  await page.getByRole('link', { name: 'Services', exact: true }).first().click();
  await expect(page.locator('section#services')).toBeInViewport();
  // Selected by tag rather than by role. This spec first ran when the mobile
  // sheet stayed open after a link click, and Radix marks the rest of the page
  // aria-hidden while it is open, so `getByRole('banner')` found nothing. That
  // was a real defect and the sheet now closes on selection, but selecting the
  // header by tag is what keeps this test measuring the navbar's height rather
  // than the sheet's open state.
  const navHeight = await page
    .locator('header')
    .evaluate((node) => node.getBoundingClientRect().height);
  const sectionTop = await page
    .locator('section#services')
    .evaluate((node) => node.getBoundingClientRect().top);
  expect(sectionTop).toBeGreaterThanOrEqual(navHeight - 2);
});

test('the active indicator follows the section in view', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop nav is hidden on mobile');
  await page.locator('section#portfolio').scrollIntoViewIfNeeded();
  await expect(page.locator('a[aria-current="location"]')).toHaveText(/portfolio/i);
});

test('the services grid does not overflow horizontally', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('every contact channel link uses the expected scheme', async ({ page }) => {
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href^="tel:"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href^="https://wa.me/"]')).toHaveCount(1);
});
