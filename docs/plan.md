# Company Profile Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-page, scroll-based company profile site whose every string, image path, and meta value is loaded at runtime from JSON files, with nine sections, monochrome editorial design, and no forms anywhere.

**Architecture:** Eight JSON files in `public/data/` are fetched by a Server Component at request time through one loader that validates with Zod and falls back to a valid empty shape on any failure. Nine presentational section components receive plain props and render no literal copy. Six small client islands carry the interactive behaviour; everything else is a Server Component.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19.2.8, TypeScript strict, Tailwind CSS 4.3.3 (CSS-first `@theme`, no `tailwind.config.js`), shadcn/ui 4.19.0 (`button`, `sheet`, `collapsible` only), lucide-react 1.35.0, Zod 4.4.3, Vitest 4.1.11 + React Testing Library, Playwright 1.62.1 + `@axe-core/playwright` 4.13.0, sharp 0.35.4 (placeholder generation only), pnpm.

**Spec:** `docs/spec.md`

## Global Constraints

- No literal display text in any component under `src/components/sections/`. Copy comes from JSON. The only exception is the empty-state strings, listed explicitly in the scanner test in Task 22.
- No `any` in TypeScript. `unknown` plus narrowing is the alternative.
- No `<form>` and no `<input>` anywhere in the rendered page.
- Placeholder content only. No real company, person, or client names. Body copy is lorem ipsum, labels are generic (`Service Name Placeholder`, `Client Placeholder 01`, `Team Member Placeholder`).
- Monochrome only. No hue outside the named grayscale tokens defined in Task 11.
- Animate only `transform` and `opacity`. Never `width`, `height`, `top`, `left`.
- Every animation respects `prefers-reduced-motion: reduce`.
- Motion durations: `fast 150ms`, `base 250ms`, `slow 400ms`. Easing `ease-out` for entering, `ease-in-out` for state changes. Defined once in Task 11, never redeclared per component.
- Section anchor ids are fixed in code: `about`, `purpose`, `services`, `portfolio`, `team`, `contact`.
- Heading levels: `h1` only in Hero, `h2` once per section, `h3` for item titles. No level skipped.
- Fetch caching is `{ next: { revalidate: 60 } }`. Never `no-store`.
- Every commit message is one plain line. No AI attribution, no `Co-Authored-By`.
- Banned words anywhere in the repo, including comments and docs: delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, seamless, elevate, embark, harness, transformative, ever-evolving, meticulous, intricate, multifaceted.

## File Structure

```
public/
  data/                    8 JSON files, the entire content surface
  assets/images/           generated raster placeholders
scripts/
  generate-placeholders.mjs   one-off, run manually, output committed
src/
  lib/
    content/
      warn.ts              warnContent(path, message)
      zod-helpers.ts       field(), arrayOf()
      schema.ts            8 section schemas
      types.ts             types inferred from schema.ts
      loader.ts            contentBase(), loadSection()
      channel-href.ts      channelHref()
    icons.ts               curated lucide registry
  components/
    sections/              Navbar Hero About Purpose Services Portfolio Team Contact Footer
    interactive/           MobileNav NavLinks Reveal PortfolioRow TeamMember CopyButton
    ui/                    shadcn output, untouched except styling tokens
  app/
    layout.tsx             fonts, metadata from site.json
    page.tsx               loads all 8, composes sections
    globals.css            @theme tokens, motion, reveal baseline
    styleguide/page.tsx    dev only
e2e/                       Playwright specs
```

Files that change together live together: everything that knows the shape of the JSON sits under `src/lib/content/`, and nothing outside that directory calls `fetch`.

---

## Task 1: Scaffold the app

**Files:**

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`

**Interfaces:**

- Consumes: nothing
- Produces: a repository where `pnpm lint`, `pnpm typecheck`, and `pnpm build` all exit 0

`create-next-app` refuses to run in a directory that already holds `docs/` and `.claude/`, so scaffold into a scratch directory and copy the result in.

- [ ] **Step 1: Scaffold into a scratch directory**

```bash
SCRATCH=$(mktemp -d)
pnpm create next-app@latest "$SCRATCH/app" \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --skip-install --yes
```

- [ ] **Step 2: Copy the scaffold into the worktree**

```bash
cp -R "$SCRATCH/app/." .
rm -rf "$SCRATCH"
pnpm install
```

Check that the copy did not overwrite `README.md`, `CLAUDE.md`, or `docs/`. If `README.md` was replaced, restore it with `git checkout -- README.md`.

- [ ] **Step 3: Turn on TypeScript strictness**

In `tsconfig.json`, confirm `"strict": true` and add:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

`noUncheckedIndexedAccess` matters here because the content layer indexes arrays that came from untrusted JSON.

- [ ] **Step 4: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 5: Add `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 6: Verify all three gates pass**

```bash
pnpm lint && pnpm typecheck && pnpm build
```

Expected: all three exit 0. Paste the output.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "scaffold next.js app with strict typescript and tailwind"
```

---

## Task 2: Vitest and React Testing Library setup

**Files:**

- Create: `vitest.config.mts`, `vitest.setup.ts`, `src/lib/smoke.test.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**

- Consumes: Task 1 scaffold
- Produces: `pnpm test` runs Vitest once and exits; `pnpm test:coverage` reports v8 coverage

Vitest cannot render async Server Components. Every section component in this plan is synchronous and takes props, so they are all unit-testable. `src/app/page.tsx` is async and is covered by E2E instead.

- [ ] **Step 1: Install dev dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/dom @testing-library/jest-dom @testing-library/user-event \
  vite-tsconfig-paths @vitest/coverage-v8 prettier
```

`prettier` belongs here rather than in Task 1: Task 1 adds the `format` script and `.prettierrc` but never installs the tool, so `pnpm format` fails until this line runs. Verify with `pnpm format --check .` before committing.

Also append `*.tsbuildinfo` to `.gitignore`. `tsc --noEmit` writes that artifact on every typecheck run and it must not reach a commit.

- [ ] **Step 2: Write `vitest.config.mts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/components/**'],
      reporter: ['text', 'json-summary'],
    },
  },
});
```

- [ ] **Step 3: Write `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Add scripts**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 5: Write the smoke test**

```ts
// src/lib/smoke.test.ts
import { expect, test } from 'vitest';

test('vitest setup runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 6: Run and paste the output**

```bash
pnpm test
```

Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "add vitest and testing library setup"
```

---

## Task 3: Playwright and axe setup

**Files:**

- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**

- Consumes: Task 1 scaffold
- Produces: `pnpm test:e2e` boots the built app and runs specs across three viewport projects named `mobile`, `tablet`, `desktop`

- [ ] **Step 1: Install**

```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
```

`E2E_BASE_URL` exists so Task 33 can run the same specs against the deployed URL.

- [ ] **Step 3: Write the smoke spec**

```ts
// e2e/smoke.spec.ts
import { expect, test } from '@playwright/test';

test('home page responds', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});
```

- [ ] **Step 4: Add script and ignore artifacts**

```json
{ "scripts": { "test:e2e": "playwright test" } }
```

Append to `.gitignore`:

```
/test-results/
/playwright-report/
/blob-report/
```

- [ ] **Step 5: Run and paste the output**

```bash
pnpm test:e2e
```

Expected: 3 passed, one per viewport project.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add playwright setup with three viewport projects"
```

---

## Task 4: CI pipeline

**Files:**

- Create: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: scripts from Tasks 1 to 3
- Produces: a workflow that fails the build if any gate fails

- [ ] **Step 1: Write the workflow**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "add ci workflow running lint typecheck test build and e2e"
```

---

## Task 5: Warning helper and Zod helpers

**Files:**

- Create: `src/lib/content/warn.ts`, `src/lib/content/zod-helpers.ts`
- Test: `src/lib/content/zod-helpers.test.ts`

**Interfaces:**

- Consumes: nothing
- Produces:
  - `warnContent(path: string, message: string): void`
  - `field<S extends z.ZodType>(schema: S, fallback: z.output<S>, path: string)` returns a schema that yields `fallback` silently when input is `undefined`, and yields `fallback` plus one warning when input is the wrong type
  - `arrayOf<S extends z.ZodType>(item: S, path: string)` returns a schema that drops invalid elements and warns once with their indices

Why `field` is built as `.default().catch()` and not `.catch()` alone: in Zod 4, `.default()` short-circuits when the input is `undefined`, so the inner parse never fails and `.catch()` never fires. A missing field is therefore silent. A wrong-typed field fails the inner parse and reaches `.catch()`, which warns. That ordering is the whole mechanism.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/content/zod-helpers.test.ts
import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { arrayOf, field } from './zod-helpers';

describe('field', () => {
  test('returns the parsed value when input is valid', () => {
    const schema = z.object({ a: field(z.string(), '', 'x.a') });
    expect(schema.parse({ a: 'hello' })).toEqual({ a: 'hello' });
  });

  test('falls back silently when the field is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ a: field(z.string(), 'fallback', 'x.a') });
    expect(schema.parse({})).toEqual({ a: 'fallback' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('falls back and warns when the field has the wrong type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ a: field(z.string(), 'fallback', 'x.a') });
    expect(schema.parse({ a: 123 })).toEqual({ a: 'fallback' });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('x.a');
    warn.mockRestore();
  });
});

describe('arrayOf', () => {
  const item = z.object({ id: z.string() });

  test('keeps every valid element', () => {
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: [{ id: 'a' }, { id: 'b' }] })).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
    });
  });

  test('drops invalid elements, keeps the rest, and warns once with the index', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: [{ id: 'a' }, { id: 7 }, { id: 'c' }] })).toEqual({
      items: [{ id: 'a' }, { id: 'c' }],
    });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('1');
    warn.mockRestore();
  });

  test('falls back to an empty array and warns when the value is not an array', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: 'nope' })).toEqual({ items: [] });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('x.items');
    warn.mockRestore();
  });

  test('defaults to an empty array silently when the key is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({})).toEqual({ items: [] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
pnpm test src/lib/content/zod-helpers.test.ts
```

Expected: FAIL, cannot resolve `./zod-helpers`.

- [ ] **Step 3: Write `src/lib/content/warn.ts`**

```ts
export function warnContent(path: string, message: string): void {
  console.warn(`[content] ${path}: ${message}`);
}
```

- [ ] **Step 4: Write `src/lib/content/zod-helpers.ts`**

```ts
import { z } from 'zod';
import { warnContent } from './warn';

export function field<S extends z.ZodType>(schema: S, fallback: z.output<S>, path: string) {
  return schema.default(fallback).catch(() => {
    warnContent(path, 'wrong type, using fallback');
    return fallback;
  });
}

export function arrayOf<S extends z.ZodType>(item: S, path: string) {
  return z
    .array(z.unknown())
    .default([])
    .catch(() => {
      warnContent(path, 'expected an array, using an empty list');
      return [];
    })
    .transform((raw): z.output<S>[] => {
      const kept: z.output<S>[] = [];
      const dropped: number[] = [];
      raw.forEach((entry, index) => {
        const result = item.safeParse(entry);
        if (result.success) kept.push(result.data);
        else dropped.push(index);
      });
      if (dropped.length > 0) {
        warnContent(
          path,
          `dropped ${dropped.length} invalid item(s) at index ${dropped.join(', ')}`,
        );
      }
      return kept;
    });
}
```

- [ ] **Step 5: Run the test and typecheck**

```bash
pnpm test src/lib/content/zod-helpers.test.ts && pnpm typecheck
```

Expected: 6 passed, typecheck exits 0. If `.default()` or `.catch()` produces a type error against `z.ZodType`, adjust the generic bound to `z.ZodTypeAny` and re-run. Do not reach for `any`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add content warning helper and zod field and array helpers"
```

---

## Task 6: Section schemas and types

**Files:**

- Create: `src/lib/content/schema.ts`, `src/lib/content/types.ts`
- Test: `src/lib/content/schema.test.ts`

**Interfaces:**

- Consumes: `field`, `arrayOf` from Task 5
- Produces, all exported from `schema.ts`: `siteSchema`, `heroSchema`, `aboutSchema`, `purposeSchema`, `servicesSchema`, `portfolioSchema`, `teamSchema`, `contactSchema`, and `sectionSchemas` mapping each file base name to its schema. From `types.ts`: `Site`, `Hero`, `About`, `Purpose`, `Services`, `Portfolio`, `Team`, `Contact`, `ContactChannel`, `ChannelType`, `UiLabels`, `ImageRef`.

`site.ui` holds the six control labels that live on buttons rather than in content: `menu`, `closeMenu`, `copy`, `copied`, `expandBio`, `collapseBio`. They sit in JSON because the brief puts labels under the same no-hardcoded-text rule as copy. Unlike every other field they default to real English words instead of an empty string, because an empty accessible name is an accessibility failure, and a typo in `site.json` must not produce an unnamed button.

- Every schema satisfies `schema.parse({})`. That is the fallback used by the loader in Task 7, so no separate fallback constants exist anywhere.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/content/schema.test.ts
import { describe, expect, test, vi } from 'vitest';
import { sectionSchemas, contactSchema, servicesSchema, portfolioSchema } from './schema';

describe('every schema parses an empty object', () => {
  test.each(Object.entries(sectionSchemas))('%s', (_name, schema) => {
    expect(() => schema.parse({})).not.toThrow();
  });
});

describe('services schema', () => {
  test('keeps valid items', () => {
    const parsed = servicesSchema.parse({
      headline: 'H',
      items: [{ icon: 'code', name: 'N', description: 'D' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.icon).toBe('code');
  });

  test('drops an item missing required keys and keeps the rest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = servicesSchema.parse({
      items: [{ icon: 'code', name: 'N', description: 'D' }, { icon: 'code' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('ignores unknown keys', () => {
    const parsed = servicesSchema.parse({ headline: 'H', somethingElse: true });
    expect(parsed).not.toHaveProperty('somethingElse');
  });

  test('falls back and warns when headline has the wrong type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(servicesSchema.parse({ headline: 42 }).headline).toBe('');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('site schema', () => {
  test('ui labels fall back to real words rather than empty strings', () => {
    const ui = sectionSchemas.site.parse({}).ui;
    expect(ui.menu).toBe('Menu');
    expect(ui.copy).toBe('Copy');
    expect(ui.expandBio).toBe('Read bio');
  });

  test('ui labels from json win over the defaults', () => {
    const ui = sectionSchemas.site.parse({ ui: { menu: 'MENU_X' } }).ui;
    expect(ui.menu).toBe('MENU_X');
    expect(ui.copy).toBe('Copy');
  });
});

describe('portfolio schema', () => {
  test('description defaults to an empty string', () => {
    const parsed = portfolioSchema.parse({
      items: [{ logo: { src: '/a.png', alt: 'A' }, title: 'T', category: 'C' }],
    });
    expect(parsed.items[0]?.description).toBe('');
  });
});

describe('contact schema', () => {
  test('keeps every known channel type', () => {
    const parsed = contactSchema.parse({
      channels: [
        { type: 'email', label: 'Email', value: 'a@b.co' },
        { type: 'hours', label: 'Hours', value: 'Mon to Fri' },
      ],
    });
    expect(parsed.channels).toHaveLength(2);
  });

  test('drops a channel with an unknown type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = contactSchema.parse({
      channels: [
        { type: 'email', label: 'Email', value: 'a@b.co' },
        { type: 'carrier-pigeon', label: 'Bird', value: 'coo' },
      ],
    });
    expect(parsed.channels).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('keeps an explicit href when present', () => {
    const parsed = contactSchema.parse({
      channels: [
        { type: 'address', label: 'Office', value: 'Street 1', href: 'https://maps.example/x' },
      ],
    });
    expect(parsed.channels[0]?.href).toBe('https://maps.example/x');
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/lib/content/schema.test.ts
```

Expected: FAIL, cannot resolve `./schema`.

- [ ] **Step 3: Write `src/lib/content/schema.ts`**

```ts
import { z } from 'zod';
import { arrayOf, field } from './zod-helpers';

const str = (path: string, fallback = '') => field(z.string(), fallback, path);

const image = (path: string) =>
  field(z.object({ src: str(`${path}.src`), alt: str(`${path}.alt`) }), { src: '', alt: '' }, path);

export const siteSchema = z.object({
  meta: field(
    z.object({
      title: str('site.meta.title'),
      description: str('site.meta.description'),
      ogImage: image('site.meta.ogImage'),
    }),
    { title: '', description: '', ogImage: { src: '', alt: '' } },
    'site.meta',
  ),
  logo: field(z.object({ wordmark: str('site.logo.wordmark') }), { wordmark: '' }, 'site.logo'),
  nav: arrayOf(z.object({ label: z.string(), href: z.string() }), 'site.nav'),
  cta: field(
    z.object({ label: str('site.cta.label'), href: str('site.cta.href') }),
    { label: '', href: '' },
    'site.cta',
  ),
  footer: field(
    z.object({
      nav: arrayOf(z.object({ label: z.string(), href: z.string() }), 'site.footer.nav'),
      copyright: str('site.footer.copyright'),
    }),
    { nav: [], copyright: '' },
    'site.footer',
  ),
  ui: field(
    z.object({
      menu: str('site.ui.menu', 'Menu'),
      closeMenu: str('site.ui.closeMenu', 'Close menu'),
      copy: str('site.ui.copy', 'Copy'),
      copied: str('site.ui.copied', 'Copied'),
      expandBio: str('site.ui.expandBio', 'Read bio'),
      collapseBio: str('site.ui.collapseBio', 'Hide bio'),
    }),
    {
      menu: 'Menu',
      closeMenu: 'Close menu',
      copy: 'Copy',
      copied: 'Copied',
      expandBio: 'Read bio',
      collapseBio: 'Hide bio',
    },
    'site.ui',
  ),
});

export const heroSchema = z.object({
  eyebrow: str('hero.eyebrow'),
  headline: str('hero.headline'),
  subheadline: str('hero.subheadline'),
  backgroundImage: image('hero.backgroundImage'),
  actions: arrayOf(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'ghost']).default('primary'),
    }),
    'hero.actions',
  ),
});

export const aboutSchema = z.object({
  label: str('about.label'),
  headline: str('about.headline'),
  paragraphs: arrayOf(z.string(), 'about.paragraphs'),
  stats: arrayOf(z.object({ value: z.string(), label: z.string() }), 'about.stats'),
});

export const purposeSchema = z.object({
  label: str('purpose.label'),
  headline: str('purpose.headline'),
  items: arrayOf(z.object({ title: z.string(), body: z.string() }), 'purpose.items'),
});

export const servicesSchema = z.object({
  label: str('services.label'),
  headline: str('services.headline'),
  items: arrayOf(
    z.object({ icon: z.string(), name: z.string(), description: z.string() }),
    'services.items',
  ),
});

export const portfolioSchema = z.object({
  label: str('portfolio.label'),
  headline: str('portfolio.headline'),
  items: arrayOf(
    z.object({
      logo: z.object({ src: z.string(), alt: z.string() }),
      title: z.string(),
      category: z.string(),
      description: z.string().default(''),
    }),
    'portfolio.items',
  ),
});

export const teamSchema = z.object({
  label: str('team.label'),
  headline: str('team.headline'),
  members: arrayOf(
    z.object({
      photo: z.object({ src: z.string(), alt: z.string() }),
      name: z.string(),
      role: z.string(),
      bio: z.string(),
    }),
    'team.members',
  ),
});

export const channelTypeSchema = z.enum([
  'email',
  'phone',
  'whatsapp',
  'address',
  'social',
  'hours',
]);

export const contactSchema = z.object({
  label: str('contact.label'),
  headline: str('contact.headline'),
  channels: arrayOf(
    z.object({
      type: channelTypeSchema,
      label: z.string(),
      value: z.string(),
      href: z.string().optional(),
    }),
    'contact.channels',
  ),
});

export const sectionSchemas = {
  site: siteSchema,
  hero: heroSchema,
  about: aboutSchema,
  purpose: purposeSchema,
  services: servicesSchema,
  portfolio: portfolioSchema,
  team: teamSchema,
  contact: contactSchema,
} as const;

export type SectionName = keyof typeof sectionSchemas;
```

- [ ] **Step 4: Write `src/lib/content/types.ts`**

```ts
import type { z } from 'zod';
import type {
  aboutSchema,
  channelTypeSchema,
  contactSchema,
  heroSchema,
  portfolioSchema,
  purposeSchema,
  servicesSchema,
  siteSchema,
  teamSchema,
} from './schema';

export type Site = z.output<typeof siteSchema>;
export type Hero = z.output<typeof heroSchema>;
export type About = z.output<typeof aboutSchema>;
export type Purpose = z.output<typeof purposeSchema>;
export type Services = z.output<typeof servicesSchema>;
export type Portfolio = z.output<typeof portfolioSchema>;
export type Team = z.output<typeof teamSchema>;
export type Contact = z.output<typeof contactSchema>;
export type ContactChannel = Contact['channels'][number];
export type UiLabels = Site['ui'];
export type ChannelType = z.output<typeof channelTypeSchema>;
export type ImageRef = { src: string; alt: string };
```

- [ ] **Step 5: Run tests and typecheck**

```bash
pnpm test src/lib/content && pnpm typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add zod schemas and inferred types for all eight content files"
```

---

## Task 7: Content loader

**Files:**

- Create: `src/lib/content/loader.ts`
- Test: `src/lib/content/loader.test.ts`

**Interfaces:**

- Consumes: `sectionSchemas` from Task 6, `warnContent` from Task 5
- Produces:
  - `contentBase(): string`
  - `loadSection<S extends z.ZodType>(name: SectionName, schema: S): Promise<z.output<S>>`
- The fallback returned on every failure path is `schema.parse({})`. There is no separate fallback object to keep in sync.
- `CONTENT_REVALIDATE` overrides the 60 second cache lifetime. It exists because Task 29 needs a run where an edit to the source file shows up immediately, and waiting 60 seconds inside a test is worse than one environment variable. Anything unset, negative, or unparseable falls back to 60.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/content/loader.test.ts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { contentBase, loadSection } from './loader';
import { servicesSchema } from './schema';

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as Response;

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('contentBase', () => {
  test('prefers CONTENT_BASE_URL and strips a trailing slash', () => {
    vi.stubEnv('CONTENT_BASE_URL', 'https://cdn.example/content/');
    expect(contentBase()).toBe('https://cdn.example/content');
  });

  test('falls back to VERCEL_URL', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app');
    expect(contentBase()).toBe('https://preview.vercel.app/data');
  });

  test('falls back to localhost', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    expect(contentBase()).toBe('http://localhost:3000/data');
  });
});

describe('loadSection', () => {
  test('returns parsed data on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse({ headline: 'H', items: [] })),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.headline).toBe('H');
  });

  test('requests the file with a 60 second revalidate', async () => {
    const fetchMock = vi.fn(async () => okResponse({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await loadSection('services', servicesSchema);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/services.json'), {
      next: { revalidate: 60 },
    });
  });

  test('falls back and warns on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }) as Response),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  test('falls back and warns when fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  test('falls back and warns on malformed JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => {
              throw new SyntaxError('Unexpected token');
            },
          }) as unknown as Response,
      ),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  test('falls back and warns when the root is not an object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse('a string')),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/lib/content/loader.test.ts
```

Expected: FAIL, cannot resolve `./loader`.

- [ ] **Step 3: Write `src/lib/content/loader.ts`**

```ts
import type { z } from 'zod';
import type { SectionName } from './schema';
import { warnContent } from './warn';

export function contentBase(): string {
  const explicit = process.env.CONTENT_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}/data`;
  return 'http://localhost:3000/data';
}

function revalidateSeconds(): number {
  const raw = Number(process.env.CONTENT_REVALIDATE);
  return Number.isFinite(raw) && raw >= 0 ? raw : 60;
}

export async function loadSection<S extends z.ZodType>(
  name: SectionName,
  schema: S,
): Promise<z.output<S>> {
  const file = `${name}.json`;
  const url = `${contentBase()}/${file}`;
  const fallback = schema.parse({}) as z.output<S>;

  let raw: unknown;
  try {
    const response = await fetch(url, { next: { revalidate: revalidateSeconds() } });
    if (!response.ok) {
      warnContent(file, `fetch returned ${response.status} for ${url}`);
      return fallback;
    }
    raw = await response.json();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    warnContent(file, `could not read ${url}: ${reason}`);
    return fallback;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    warnContent(file, `does not match the expected shape: ${result.error.message}`);
    return fallback;
  }
  return result.data as z.output<S>;
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test src/lib/content/loader.test.ts
```

Expected: 9 passed.

- [ ] **Step 5: Confirm branch coverage of the content layer**

```bash
pnpm test:coverage
```

Expected: `src/lib/content/` at 100% branch. If a branch is uncovered, add the missing test before moving on.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add runtime json loader with fallback on every failure path"
```

---

## Task 8: Contact channel href helper

**Files:**

- Create: `src/lib/content/channel-href.ts`
- Test: `src/lib/content/channel-href.test.ts`

**Interfaces:**

- Consumes: `ChannelType` from Task 6
- Produces: `channelHref(type: ChannelType, value: string, href?: string): string | undefined`. `undefined` means the component renders a `<span>` rather than an `<a>`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/content/channel-href.test.ts
import { describe, expect, test } from 'vitest';
import { channelHref } from './channel-href';

describe('channelHref', () => {
  test('builds a mailto link', () => {
    expect(channelHref('email', 'hello@placeholder.test')).toBe('mailto:hello@placeholder.test');
  });

  test('builds a tel link with separators removed', () => {
    expect(channelHref('phone', '+62 (21) 0000-0000')).toBe('tel:+622100000000');
  });

  test('builds a wa.me link with digits only', () => {
    expect(channelHref('whatsapp', '+62 812-0000-0000')).toBe('https://wa.me/6281200000000');
  });

  test('passes a social url through unchanged', () => {
    expect(channelHref('social', 'https://example.test/profile')).toBe(
      'https://example.test/profile',
    );
  });

  test('returns undefined for an address without an explicit href', () => {
    expect(channelHref('address', 'Placeholder Street 1')).toBeUndefined();
  });

  test('returns undefined for hours', () => {
    expect(channelHref('hours', 'Mon to Fri, 09.00 to 17.00')).toBeUndefined();
  });

  test('an explicit href wins over the derived value', () => {
    expect(channelHref('email', 'hello@placeholder.test', 'https://forms.example/x')).toBe(
      'https://forms.example/x',
    );
    expect(channelHref('address', 'Placeholder Street 1', 'https://maps.example/x')).toBe(
      'https://maps.example/x',
    );
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/lib/content/channel-href.test.ts
```

Expected: FAIL, cannot resolve `./channel-href`.

- [ ] **Step 3: Write `src/lib/content/channel-href.ts`**

```ts
import type { ChannelType } from './types';

export function channelHref(type: ChannelType, value: string, href?: string): string | undefined {
  if (href) return href;
  switch (type) {
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/\D/g, '')}`;
    case 'social':
      return value;
    case 'address':
    case 'hours':
      return undefined;
  }
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test src/lib/content/channel-href.test.ts
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add contact channel href helper"
```

---

## Task 9: Icon registry

**Files:**

- Create: `src/lib/icons.ts`
- Test: `src/lib/icons.test.ts`

**Interfaces:**

- Consumes: `warnContent` from Task 5
- Produces: `getIcon(name: string): LucideIcon` and `ICON_NAMES: readonly string[]`. `ICON_NAMES` is the exact list published in `docs/EDITING-CONTENT.md` by Task 31.

The registry is a curated list rather than the whole lucide set, so the bundle carries only what is used. Adding a name later is one line here plus one line in the docs.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/icons.test.ts
import { describe, expect, test, vi } from 'vitest';
import { getIcon, ICON_NAMES } from './icons';

describe('getIcon', () => {
  test('returns a component for every published name', () => {
    for (const name of ICON_NAMES) {
      expect(getIcon(name)).toBeTypeOf('function');
    }
  });

  test('returns the fallback and warns for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getIcon('not-a-real-icon')).toBeTypeOf('function');
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('not-a-real-icon');
    warn.mockRestore();
  });

  test('publishes at least twelve names so every service can differ', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(12);
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/lib/icons.test.ts
```

Expected: FAIL, cannot resolve `./icons`.

- [ ] **Step 3: Write `src/lib/icons.ts`**

```ts
import {
  Boxes,
  CircleDashed,
  Cloud,
  Code,
  Cpu,
  Database,
  Globe,
  Headphones,
  Layers,
  LineChart,
  Lock,
  Monitor,
  Network,
  Search,
  Server,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { warnContent } from './content/warn';

const ICONS = {
  boxes: Boxes,
  cloud: Cloud,
  code: Code,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  headphones: Headphones,
  layers: Layers,
  'line-chart': LineChart,
  lock: Lock,
  monitor: Monitor,
  network: Network,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  smartphone: Smartphone,
  terminal: Terminal,
  workflow: Workflow,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export const ICON_NAMES = Object.keys(ICONS) as readonly string[];

export function getIcon(name: string): LucideIcon {
  const icon = ICONS[name as keyof typeof ICONS];
  if (icon) return icon;
  warnContent('services.json', `unknown icon "${name}", using the fallback icon instead`);
  return CircleDashed;
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test src/lib/icons.test.ts
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add curated lucide icon registry with fallback"
```

---

## Task 10: Placeholder content and generated images

**Files:**

- Create: `public/data/site.json`, `hero.json`, `about.json`, `purpose.json`, `services.json`, `portfolio.json`, `team.json`, `contact.json`
- Create: `scripts/generate-placeholders.mjs`
- Create: `public/assets/images/hero-bg.jpg`, `portfolio-01.png` through `portfolio-06.png`, `team-01.jpg`, `team-02.jpg`
- Test: `src/lib/content/data.test.ts`

**Interfaces:**

- Consumes: `sectionSchemas` from Task 6
- Produces: the eight real content files that every later task and every E2E spec reads

Content rules for this task: body copy is lorem ipsum, names are generic placeholders, and no string resembles a real company, person, or client. Labels and alt text are real English words written plainly.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/content/data.test.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { sectionSchemas } from './schema';

const read = (name: string) =>
  JSON.parse(readFileSync(join(process.cwd(), 'public/data', `${name}.json`), 'utf8'));

describe('shipped content files', () => {
  test.each(Object.entries(sectionSchemas))('%s.json parses with no warnings', (name, schema) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => schema.parse(read(name))).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('the required item counts are present', () => {
    expect(sectionSchemas.purpose.parse(read('purpose')).items).toHaveLength(4);
    expect(sectionSchemas.services.parse(read('services')).items).toHaveLength(12);
    expect(sectionSchemas.portfolio.parse(read('portfolio')).items).toHaveLength(6);
    expect(sectionSchemas.team.parse(read('team')).members).toHaveLength(2);
    expect(sectionSchemas.about.parse(read('about')).stats).toHaveLength(3);
  });

  test('every service icon name exists in the registry', async () => {
    const { ICON_NAMES } = await import('../icons');
    for (const item of sectionSchemas.services.parse(read('services')).items) {
      expect(ICON_NAMES).toContain(item.icon);
    }
  });

  test('every nav href points at a known section id', () => {
    const ids = ['#about', '#purpose', '#services', '#portfolio', '#team', '#contact'];
    for (const item of sectionSchemas.site.parse(read('site')).nav) {
      expect(ids).toContain(item.href);
    }
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/lib/content/data.test.ts
```

Expected: FAIL, no such file `public/data/site.json`.

- [ ] **Step 3: Write the image generator**

```js
// scripts/generate-placeholders.mjs
// Run once with: node scripts/generate-placeholders.mjs
// Output is committed. Regenerate only if a slot's dimensions change.
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/assets/images';
mkdirSync(OUT, { recursive: true });

const tile = (w, h, shade) =>
  sharp({
    create: { width: w, height: h, channels: 3, background: { r: shade, g: shade, b: shade } },
  });

await tile(1920, 1080, 32).jpeg({ quality: 82 }).toFile(`${OUT}/hero-bg.jpg`);

for (let i = 1; i <= 6; i += 1) {
  await tile(600, 200, 210 - i * 8)
    .png()
    .toFile(`${OUT}/portfolio-0${i}.png`);
}

for (let i = 1; i <= 2; i += 1) {
  await tile(800, 800, 120 + i * 30)
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/team-0${i}.jpg`);
}

console.log('placeholders written to', OUT);
```

- [ ] **Step 4: Generate the images**

```bash
pnpm add -D sharp
node scripts/generate-placeholders.mjs
ls -la public/assets/images
```

Expected: nine files.

- [ ] **Step 5: Write the eight JSON files**

`public/data/site.json`:

```json
{
  "meta": {
    "title": "Company Profile Placeholder",
    "description": "Placeholder description for the company profile site. Replace this text in site.json.",
    "ogImage": { "src": "/assets/images/hero-bg.jpg", "alt": "Placeholder social share image" }
  },
  "logo": { "wordmark": "PLACEHOLDER" },
  "nav": [
    { "label": "About", "href": "#about" },
    { "label": "Purpose", "href": "#purpose" },
    { "label": "Services", "href": "#services" },
    { "label": "Portfolio", "href": "#portfolio" },
    { "label": "Team", "href": "#team" },
    { "label": "Contact", "href": "#contact" }
  ],
  "cta": { "label": "Get in touch", "href": "#contact" },
  "footer": {
    "nav": [
      { "label": "Services", "href": "#services" },
      { "label": "Portfolio", "href": "#portfolio" },
      { "label": "Contact", "href": "#contact" }
    ],
    "copyright": "2026 Company Placeholder. All rights reserved."
  },
  "ui": {
    "menu": "Menu",
    "closeMenu": "Close menu",
    "copy": "Copy",
    "copied": "Copied",
    "expandBio": "Read bio",
    "collapseBio": "Hide bio"
  }
}
```

`public/data/hero.json`:

```json
{
  "eyebrow": "Lorem ipsum dolor",
  "headline": "Lorem ipsum dolor sit amet consectetur adipiscing elit",
  "subheadline": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "backgroundImage": { "src": "/assets/images/hero-bg.jpg", "alt": "Placeholder background image" },
  "actions": [
    { "label": "View services", "href": "#services", "variant": "primary" },
    { "label": "Get in touch", "href": "#contact", "variant": "ghost" }
  ]
}
```

`public/data/about.json`:

```json
{
  "label": "About",
  "headline": "Lorem ipsum dolor sit amet consectetur",
  "paragraphs": [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis."
  ],
  "stats": [
    { "value": "120+", "label": "Lorem ipsum dolor" },
    { "value": "15", "label": "Consectetur adipiscing" },
    { "value": "98%", "label": "Sed do eiusmod" }
  ]
}
```

`public/data/purpose.json`:

```json
{
  "label": "Purpose",
  "headline": "Lorem ipsum dolor sit amet",
  "items": [
    {
      "title": "Lorem Ipsum Placeholder One",
      "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      "title": "Lorem Ipsum Placeholder Two",
      "body": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
    },
    {
      "title": "Lorem Ipsum Placeholder Three",
      "body": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      "title": "Lorem Ipsum Placeholder Four",
      "body": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim."
    }
  ]
}
```

`public/data/services.json`: twelve items, each using a distinct name from `ICON_NAMES`.

```json
{
  "label": "Services",
  "headline": "Lorem ipsum dolor sit amet consectetur",
  "items": [
    {
      "icon": "code",
      "name": "Service Name Placeholder 01",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "smartphone",
      "name": "Service Name Placeholder 02",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "cloud",
      "name": "Service Name Placeholder 03",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "server",
      "name": "Service Name Placeholder 04",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "database",
      "name": "Service Name Placeholder 05",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "shield",
      "name": "Service Name Placeholder 06",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "network",
      "name": "Service Name Placeholder 07",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "workflow",
      "name": "Service Name Placeholder 08",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "line-chart",
      "name": "Service Name Placeholder 09",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "monitor",
      "name": "Service Name Placeholder 10",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "headphones",
      "name": "Service Name Placeholder 11",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    },
    {
      "icon": "wrench",
      "name": "Service Name Placeholder 12",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod."
    }
  ]
}
```

`public/data/portfolio.json`: six items. Give four of them a `description` and leave two without, so both disclosure branches are exercised by the shipped content.

```json
{
  "label": "Portfolio",
  "headline": "Lorem ipsum dolor sit amet",
  "items": [
    {
      "logo": { "src": "/assets/images/portfolio-01.png", "alt": "Placeholder client logo 01" },
      "title": "Client Placeholder 01",
      "category": "Lorem ipsum",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "logo": { "src": "/assets/images/portfolio-02.png", "alt": "Placeholder client logo 02" },
      "title": "Client Placeholder 02",
      "category": "Dolor sit",
      "description": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      "logo": { "src": "/assets/images/portfolio-03.png", "alt": "Placeholder client logo 03" },
      "title": "Client Placeholder 03",
      "category": "Amet consectetur",
      "description": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      "logo": { "src": "/assets/images/portfolio-04.png", "alt": "Placeholder client logo 04" },
      "title": "Client Placeholder 04",
      "category": "Adipiscing elit",
      "description": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
      "logo": { "src": "/assets/images/portfolio-05.png", "alt": "Placeholder client logo 05" },
      "title": "Client Placeholder 05",
      "category": "Sed do eiusmod"
    },
    {
      "logo": { "src": "/assets/images/portfolio-06.png", "alt": "Placeholder client logo 06" },
      "title": "Client Placeholder 06",
      "category": "Tempor incididunt"
    }
  ]
}
```

`public/data/team.json`:

```json
{
  "label": "Team",
  "headline": "Lorem ipsum dolor sit amet",
  "members": [
    {
      "photo": {
        "src": "/assets/images/team-01.jpg",
        "alt": "Placeholder portrait of the first team member"
      },
      "name": "Team Member Placeholder 01",
      "role": "Role Placeholder",
      "bio": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      "photo": {
        "src": "/assets/images/team-02.jpg",
        "alt": "Placeholder portrait of the second team member"
      },
      "name": "Team Member Placeholder 02",
      "role": "Role Placeholder",
      "bio": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
    }
  ]
}
```

`public/data/contact.json`: one channel of every type, so all six branches of `channelHref` are exercised by the shipped content.

```json
{
  "label": "Contact",
  "headline": "Lorem ipsum dolor sit amet",
  "channels": [
    {
      "type": "address",
      "label": "Office",
      "value": "Placeholder Street 1, Placeholder City 00000"
    },
    { "type": "email", "label": "Email", "value": "hello@placeholder.test" },
    { "type": "phone", "label": "Phone", "value": "+62 21 0000 0000" },
    { "type": "whatsapp", "label": "WhatsApp", "value": "+62 812 0000 0000" },
    { "type": "hours", "label": "Hours", "value": "Monday to Friday, 09.00 to 17.00" },
    { "type": "social", "label": "Instagram", "value": "https://instagram.example/placeholder" },
    { "type": "social", "label": "LinkedIn", "value": "https://linkedin.example/placeholder" }
  ]
}
```

- [ ] **Step 6: Run the test**

```bash
pnpm test src/lib/content/data.test.ts
```

Expected: all pass, including the zero-warning assertion.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "add placeholder content files and generated image placeholders"
```

---

## Task 11: Design tokens and fonts

**Files:**

- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Test: `src/app/tokens.test.ts`

**Interfaces:**

- Consumes: nothing
- Produces: the token names every later task uses. Colors `paper mist ash graphite ink void`. Fonts `--font-display --font-body --font-mono`. Motion `--duration-fast --duration-base --duration-slow --ease-out --ease-in-out`. Layout `--nav-h --space-section --space-gutter`. Radius `--radius-none`.

The navbar keeps one height. An earlier draft had it shrink on scroll, which would have animated a layout property and shifted every section below it. What changes on scroll instead is the navbar background and its bottom hairline, wired up in Task 25.

Tailwind 4 has no `tailwind.config.js`. Tokens are declared in CSS inside `@theme`, and Tailwind generates utilities from them, so `--color-paper` yields `bg-paper` and `text-paper`.

Three typefaces, each with a job. Bodoni Moda is a high contrast didone used only at display sizes, where its thin strokes are an asset rather than a legibility problem. Archivo is a neutral grotesque for body text. IBM Plex Mono carries labels, categories, and stat captions. None of them is Inter.

Border radius is `0` everywhere. Editorial print has no rounded corners, and in a monochrome palette the separation work is done by hairlines and space. This is written down so nobody reaches for `rounded-lg` out of habit.

Hover and focus are kept visually distinct by rule: hover changes background or text colour and never draws an outline, focus draws a 2px outline and never changes the background. Task 28 asserts this.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/tokens.test.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

const REQUIRED = [
  '--color-paper',
  '--color-mist',
  '--color-ash',
  '--color-graphite',
  '--color-ink',
  '--color-void',
  '--font-display',
  '--font-body',
  '--font-mono',
  '--duration-fast',
  '--duration-base',
  '--duration-slow',
  '--ease-out',
  '--ease-in-out',
  '--nav-h',
  '--space-section',
  '--space-gutter',
];

describe('design tokens', () => {
  test.each(REQUIRED)('%s is defined', (token) => {
    expect(css).toContain(`${token}:`);
  });

  test('declares a reduced motion block', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });

  test('declares the scripting-enabled reveal baseline', () => {
    expect(css).toContain('scripting: enabled');
  });

  test('defines a focus-visible outline', () => {
    expect(css).toContain(':focus-visible');
  });

  test('contains no hue outside the grayscale palette', () => {
    const hexes = css.match(/#[0-9a-fA-F]{6}/g) ?? [];
    for (const hex of hexes) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(8);
    }
  });
});
```

The last test is the monochrome guard. It allows a maximum channel spread of 8 so the warm paper and cool ink tones stay legal while any real hue fails.

- [ ] **Step 2: Run and confirm it fails**

```bash
pnpm test src/app/tokens.test.ts
```

Expected: FAIL, tokens not found.

- [ ] **Step 3: Write `src/app/globals.css`**

```css
@import 'tailwindcss';

@theme {
  --color-paper: #faf9f7;
  --color-mist: #eeedea;
  --color-ash: #c9c8c3;
  --color-graphite: #595853;
  --color-ink: #1a1a18;
  --color-void: #000000;

  --font-display: var(--font-bodoni), Georgia, 'Times New Roman', serif;
  --font-body: var(--font-archivo), 'Helvetica Neue', Arial, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, 'SF Mono', monospace;

  --text-display: clamp(2.75rem, 7vw, 6.5rem);
  --text-h2: clamp(1.875rem, 4vw, 3.25rem);
  --text-h3: 1.25rem;
  --text-body: 1.0625rem;
  --text-small: 0.875rem;
  --text-label: 0.75rem;

  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  --nav-h: 4.5rem;
  --space-section: clamp(5rem, 10vw, 9rem);
  --space-gutter: clamp(1.25rem, 4vw, 4rem);

  --radius-none: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-body);
  -webkit-font-smoothing: antialiased;
}

section[id] {
  scroll-margin-top: var(--nav-h);
}

/* Focus never changes the background, hover never draws an outline.
   Keeping the two channels separate is what makes them tell apart. */
:focus-visible {
  outline: 2px solid var(--color-void);
  outline-offset: 2px;
}

/* Reveal baseline: content is visible with no JS. The hidden state only
   exists where scripting can undo it. */
[data-reveal] {
  opacity: 1;
  transform: none;
}

@media (scripting: enabled) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity var(--duration-slow) var(--ease-out),
      transform var(--duration-slow) var(--ease-out);
  }

  [data-reveal='shown'] {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }

  [data-reveal],
  [data-reveal='shown'] {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 4: Wire the fonts in `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Archivo, Bodoni_Moda, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-bodoni',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-archivo',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = { title: 'Company Profile' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Task 24 replaces the static `metadata` export with one generated from `site.json`.

- [ ] **Step 5: Run the test and the build**

```bash
pnpm test src/app/tokens.test.ts && pnpm build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add monochrome design tokens motion tokens and three typefaces"
```

---

## Task 12: Styleguide page, development only

**Files:**

- Create: `src/app/styleguide/page.tsx`
- Test: `src/app/styleguide/page.test.tsx`

**Interfaces:**

- Consumes: tokens from Task 11
- Produces: a page at `/styleguide` that renders the palette, type scale, motion tokens, and every interactive state, and that returns 404 in production

This page is the artefact reviewed at the Fase 5 gate. Build it before any section, so the visual direction is approved once rather than nine times.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/styleguide/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

describe('styleguide page', () => {
  test('renders the token sections in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { default: Page } = await import('./page');
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('paper')).toBeInTheDocument();
    expect(screen.getByText('void')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  test('is not found in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { default: Page } = await import('./page');
    expect(() => render(<Page />)).toThrow('NEXT_NOT_FOUND');
    vi.unstubAllEnvs();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Write the page**

Render, in this order, each block separated by a hairline rule: the six colour swatches labelled with their token name and hex; the type scale showing display, h2, h3, body, small, and label at real size with the family name beside each; the three motion durations as a row that animates a small square on hover; a button in primary and ghost variants shown in rest, hover, focus, and disabled state; a hairline sample; and the spacing tokens drawn as bars.

```tsx
import { notFound } from 'next/navigation';

const COLORS = [
  ['paper', 'var(--color-paper)'],
  ['mist', 'var(--color-mist)'],
  ['ash', 'var(--color-ash)'],
  ['graphite', 'var(--color-graphite)'],
  ['ink', 'var(--color-ink)'],
  ['void', 'var(--color-void)'],
] as const;

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main className="mx-auto max-w-4xl px-[var(--space-gutter)] py-16">
      <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-h2)]">
        Styleguide
      </h1>
      <section aria-labelledby="palette">
        <h2
          id="palette"
          className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em]"
        >
          Palette
        </h2>
        <ul>
          {COLORS.map(([name, value]) => (
            <li key={name} className="flex items-center gap-4 border-b border-ash py-3">
              <span aria-hidden className="h-10 w-10" style={{ background: value }} />
              <span className="font-[family-name:var(--font-mono)]">{name}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* type scale, motion, button states, hairline, spacing follow the same pattern */}
    </main>
  );
}
```

Fill in the remaining blocks described above before moving on. The test only pins the palette, the rest is reviewed by eye at the gate.

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Look at the page**

```bash
pnpm dev
```

Open `http://localhost:3000/styleguide`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add development-only styleguide page"
```

- [ ] **Step 7: Run Gate A and stop**

Compare each token decision against the generic version written in `docs/spec.md` section 5. For every token, answer in one line whether it is a choice for this brief or a default that would appear in any brief. Report what changed and why, then wait for approval before Task 13.

---

## Task 13: Shared section heading

**Files:**

- Create: `src/components/sections/SectionHeading.tsx`
- Test: `src/components/sections/SectionHeading.test.tsx`

**Interfaces:**

- Consumes: nothing
- Produces: `<SectionHeading id={string} label={string} headline={string} />`, used by About, Purpose, Services, Portfolio, Team, and Contact. It renders the mono label in the left margin and an `h2`. The `h2` text is `headline`, falling back to `label`, falling back to `id`.

Every section test defines its own fixtures inline rather than importing a shared fixtures file, so that the nine section tasks can be worked in parallel without touching a common file.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/SectionHeading.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  test('renders the headline as an h2', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="HEADLINE_X" />);
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders the label alongside the headline', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="HEADLINE_X" />);
    expect(screen.getByText('LABEL_X')).toBeInTheDocument();
  });

  test('falls back to the label when the headline is empty', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="" />);
    expect(screen.getByRole('heading', { level: 2, name: 'LABEL_X' })).toBeInTheDocument();
  });

  test('falls back to the id when both are empty', () => {
    render(<SectionHeading id="services" label="" headline="" />);
    expect(screen.getByRole('heading', { level: 2, name: 'services' })).toBeInTheDocument();
  });

  test('renders no label element when the label is empty', () => {
    const { container } = render(<SectionHeading id="services" label="" headline="HEADLINE_X" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

```tsx
export function SectionHeading({
  id,
  label,
  headline,
}: {
  id: string;
  label: string;
  headline: string;
}) {
  const text = headline || label || id;
  return (
    <div className="mb-[calc(var(--space-section)/3)] md:grid md:grid-cols-[8rem_1fr] md:gap-[var(--space-gutter)]">
      {label ? (
        <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-graphite">
          {label}
        </p>
      ) : null}
      <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-h2)] leading-[1.05] text-balance">
        {text}
      </h2>
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add shared section heading component"
```

---

## Task 14: Navbar and mobile panel

**Files:**

- Create: `src/components/sections/Navbar.tsx`, `src/components/interactive/MobileNav.tsx`
- Create: `src/components/ui/button.tsx`, `src/components/ui/sheet.tsx` via shadcn
- Test: `src/components/sections/Navbar.test.tsx`, `src/components/interactive/MobileNav.test.tsx`

**Interfaces:**

- Consumes: `Site` and `UiLabels` from Task 6
- Produces: `<Navbar logo={Site['logo']} nav={Site['nav']} cta={Site['cta']} ui={UiLabels} />` and `<MobileNav nav={Site['nav']} cta={Site['cta']} ui={UiLabels} />`. `NavLinks` is added in Task 26; until then Navbar renders plain anchors.
- No control label is written in the component. `Menu` and `Close menu` arrive through `ui`.

- [ ] **Step 1: Install the two shadcn components**

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button sheet
```

- [ ] **Step 2: Strip the generated palette**

`shadcn init` writes its own colour variables into `globals.css`. Delete every colour variable it added and repoint `button.tsx` and `sheet.tsx` at the tokens from Task 11. Re-run `pnpm test src/app/tokens.test.ts`; that test fails both if a generated hue survived and if `init` clobbered any token from Task 11.

Also delete every `outline-none` and `focus-visible:ring-*` class the generated components carry. They suppress the global `:focus-visible` outline defined in Task 11, and the keyboard journey in Task 28 asserts a non-zero `outlineWidth` on every focusable element. Ring utilities are not a substitute there, because `getComputedStyle` reports `outlineWidth: 0px` for a ring.

Then re-run `pnpm test src/app/tokens.test.ts && pnpm typecheck` before continuing.

- [ ] **Step 3: Write the failing tests**

```tsx
// src/components/sections/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Navbar } from './Navbar';

const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};

const props = {
  logo: { wordmark: 'WORDMARK_X' },
  nav: [
    { label: 'NAV_ONE_X', href: '#about' },
    { label: 'NAV_TWO_X', href: '#services' },
  ],
  cta: { label: 'CTA_X', href: '#contact' },
  ui,
};

describe('Navbar', () => {
  test('renders the wordmark from props', () => {
    render(<Navbar {...props} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
  });

  test('renders one link per nav item with its href', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('link', { name: 'NAV_ONE_X' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'NAV_TWO_X' })).toHaveAttribute('href', '#services');
  });

  test('renders the cta link', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('link', { name: 'CTA_X' })).toHaveAttribute('href', '#contact');
  });

  test('renders wordmark and cta when nav is empty', () => {
    render(<Navbar {...props} nav={[]} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CTA_X' })).toBeInTheDocument();
  });

  test('is a banner landmark', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/interactive/MobileNav.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { MobileNav } from './MobileNav';

const props = {
  nav: [{ label: 'NAV_ONE_X', href: '#about' }],
  cta: { label: 'CTA_X', href: '#contact' },
  ui: {
    menu: 'MENU_X',
    closeMenu: 'CLOSE_MENU_X',
    copy: 'COPY_X',
    copied: 'COPIED_X',
    expandBio: 'EXPAND_BIO_X',
    collapseBio: 'COLLAPSE_BIO_X',
  },
};

describe('MobileNav', () => {
  test('the trigger is named from the ui labels, not from the component', () => {
    render(<MobileNav {...props} />);
    expect(screen.getByRole('button', { name: 'MENU_X' })).toBeInTheDocument();
  });

  test('opening the panel reveals every nav link and the cta', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    expect(await screen.findByRole('link', { name: 'NAV_ONE_X' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CTA_X' })).toBeInTheDocument();
  });

  test('the close control is named from the ui labels', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    expect(await screen.findByRole('button', { name: 'CLOSE_MENU_X' })).toBeInTheDocument();
  });

  test('escape closes the panel', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('link', { name: 'NAV_ONE_X' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run both and confirm they fail**

- [ ] **Step 5: Implement Navbar and MobileNav**

Navbar is a Server Component rendering `<header data-nav>` fixed to the top, holding the wordmark, the desktop nav list hidden below `md`, the CTA, and `<MobileNav>` shown only below `md`. Its height is `var(--nav-h)` and never changes. What reacts to scrolling is its background, driven by the `data-scrolled` attribute that Task 25 sets on the root element. MobileNav is a Client Component wrapping shadcn `Sheet`, with the trigger labelled `Menu` and the close control labelled `Close menu`.

- [ ] **Step 6: Run tests, then a11y check the heading order and landmark**

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "add navbar with mobile panel"
```

---

## Task 15: Hero

**Files:**

- Create: `src/components/sections/Hero.tsx`
- Test: `src/components/sections/Hero.test.tsx`

**Interfaces:**

- Consumes: `Hero` type from Task 6
- Produces: `<Hero {...hero} />` rendering the only `h1` on the page

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Hero } from './Hero';

const props = {
  eyebrow: 'EYEBROW_X',
  headline: 'HEADLINE_X',
  subheadline: 'SUBHEADLINE_X',
  backgroundImage: { src: '/assets/images/hero-bg.jpg', alt: 'ALT_X' },
  actions: [
    { label: 'PRIMARY_X', href: '#services', variant: 'primary' as const },
    { label: 'GHOST_X', href: '#contact', variant: 'ghost' as const },
  ],
};

describe('Hero', () => {
  test('renders the headline as the only h1', () => {
    render(<Hero {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders eyebrow and subheadline from props', () => {
    render(<Hero {...props} />);
    expect(screen.getByText('EYEBROW_X')).toBeInTheDocument();
    expect(screen.getByText('SUBHEADLINE_X')).toBeInTheDocument();
  });

  test('renders no eyebrow element when the eyebrow is empty', () => {
    render(<Hero {...props} eyebrow="" />);
    expect(screen.queryByText('EYEBROW_X')).not.toBeInTheDocument();
  });

  test('renders one link per action with its href', () => {
    render(<Hero {...props} />);
    expect(screen.getByRole('link', { name: 'PRIMARY_X' })).toHaveAttribute('href', '#services');
    expect(screen.getByRole('link', { name: 'GHOST_X' })).toHaveAttribute('href', '#contact');
  });

  test('renders no links when actions is empty', () => {
    render(<Hero {...props} actions={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  test('uses the alt text from props for the background image', () => {
    render(<Hero {...props} />);
    expect(screen.getByAltText('ALT_X')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

The background is a `next/image` with `fill`, `priority`, and `sizes="100vw"`, sitting behind the text with an ink overlay whose opacity comes from a token, not an arbitrary value. Headline uses `--text-display` in the display family. Actions render as anchors styled by variant, not as `<button>`, because they navigate.

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add hero section"
```

---

## Task 16: About

**Files:**

- Create: `src/components/sections/About.tsx`
- Test: `src/components/sections/About.test.tsx`

**Interfaces:**

- Consumes: `About` type from Task 6, `SectionHeading` from Task 13
- Produces: `<About {...about} />` inside `<section id="about">`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/About.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { About } from './About';

const props = {
  label: 'LABEL_X',
  headline: 'HEADLINE_X',
  paragraphs: ['PARA_ONE_X', 'PARA_TWO_X'],
  stats: [
    { value: 'VALUE_ONE_X', label: 'STAT_ONE_X' },
    { value: 'VALUE_TWO_X', label: 'STAT_TWO_X' },
    { value: 'VALUE_THREE_X', label: 'STAT_THREE_X' },
  ],
};

describe('About', () => {
  test('renders an h2 from the headline', () => {
    render(<About {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders one paragraph per entry', () => {
    render(<About {...props} />);
    expect(screen.getByText('PARA_ONE_X')).toBeInTheDocument();
    expect(screen.getByText('PARA_TWO_X')).toBeInTheDocument();
  });

  test('renders every stat value and label', () => {
    render(<About {...props} />);
    expect(screen.getByText('VALUE_TWO_X')).toBeInTheDocument();
    expect(screen.getByText('STAT_THREE_X')).toBeInTheDocument();
  });

  test('renders the section with the about id', () => {
    const { container } = render(<About {...props} />);
    expect(container.querySelector('section#about')).not.toBeNull();
  });

  test('omits the stats block when stats is empty but keeps the section', () => {
    render(<About {...props} stats={[]} />);
    expect(screen.queryByText('STAT_ONE_X')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  test('omits the paragraph block when paragraphs is empty', () => {
    render(<About {...props} paragraphs={[]} />);
    expect(screen.queryByText('PARA_ONE_X')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

Stats sit in a row separated by hairlines, value in the display family at a large size, label in mono uppercase beneath. No cards.

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add about section"
```

---

## Task 17: Purpose

**Files:**

- Create: `src/components/sections/Purpose.tsx`
- Test: `src/components/sections/Purpose.test.tsx`

**Interfaces:**

- Consumes: `Purpose` type from Task 6, `SectionHeading` from Task 13
- Produces: `<Purpose {...purpose} />` inside `<section id="purpose">`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/Purpose.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Purpose } from './Purpose';

const items = [1, 2, 3, 4].map((n) => ({ title: `TITLE_${n}_X`, body: `BODY_${n}_X` }));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items };

describe('Purpose', () => {
  test('renders every item as an h3 with its body', () => {
    render(<Purpose {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    expect(screen.getByRole('heading', { level: 3, name: 'TITLE_4_X' })).toBeInTheDocument();
    expect(screen.getByText('BODY_4_X')).toBeInTheDocument();
  });

  test('renders the section with the purpose id', () => {
    const { container } = render(<Purpose {...props} />);
    expect(container.querySelector('section#purpose')).not.toBeNull();
  });

  test('renders an empty state when items is empty', () => {
    render(<Purpose {...props} items={[]} />);
    expect(
      screen.getByText('No purpose statements yet. Add items to purpose.json.'),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

Four statements in a two by two grid on desktop, stacked below `md`, separated by hairlines rather than borders on all four sides.

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add purpose section"
```

---

## Task 18: Services

**Files:**

- Create: `src/components/sections/Services.tsx`
- Test: `src/components/sections/Services.test.tsx`

**Interfaces:**

- Consumes: `Services` type from Task 6, `getIcon` from Task 9, `SectionHeading` from Task 13
- Produces: `<Services {...services} />` inside `<section id="services">`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/Services.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Services } from './Services';

const items = Array.from({ length: 12 }, (_, i) => ({
  icon: 'code',
  name: `SERVICE_${i}_X`,
  description: `DESC_${i}_X`,
}));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items };

describe('Services', () => {
  test('renders all twelve items', () => {
    render(<Services {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12);
    expect(screen.getByRole('heading', { level: 3, name: 'SERVICE_11_X' })).toBeInTheDocument();
    expect(screen.getByText('DESC_11_X')).toBeInTheDocument();
  });

  test('renders an icon for each item', () => {
    const { container } = render(<Services {...props} />);
    expect(container.querySelectorAll('svg')).toHaveLength(12);
  });

  test('icons are hidden from assistive technology', () => {
    const { container } = render(<Services {...props} />);
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('an unknown icon name renders the fallback and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Services {...props} items={[{ icon: 'nope-x', name: 'N_X', description: 'D_X' }]} />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('does not number the items', () => {
    render(<Services {...props} />);
    expect(screen.queryByText('01')).not.toBeInTheDocument();
  });

  test('renders an empty state when items is empty', () => {
    render(<Services {...props} items={[]} />);
    expect(screen.getByText('No services yet. Add items to services.json.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

One column below `md`, two at `md`, three at `xl`. Cells are separated by hairlines drawn with a single border on two edges of the grid container, so no cell carries a full box. Icon at 20px above the name, `aria-hidden` because the name already carries the meaning.

- [ ] **Step 4: Run the test**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add services section"
```

---

## Task 19: Portfolio and row disclosure

**Files:**

- Create: `src/components/sections/Portfolio.tsx`, `src/components/interactive/PortfolioRow.tsx`
- Create: `src/components/ui/collapsible.tsx` via shadcn
- Test: `src/components/sections/Portfolio.test.tsx`, `src/components/interactive/PortfolioRow.test.tsx`

**Interfaces:**

- Consumes: `Portfolio` type from Task 6, `SectionHeading` from Task 13
- Produces: `<Portfolio {...portfolio} />` inside `<section id="portfolio">`, and `<PortfolioRow item={Portfolio['items'][number]} />`

- [ ] **Step 1: Add the shadcn component**

```bash
pnpm dlx shadcn@latest add collapsible
```

Strip any colour variable it introduces, same as Task 14 Step 2.

- [ ] **Step 2: Write the failing tests**

```tsx
// src/components/sections/Portfolio.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Portfolio } from './Portfolio';

const items = Array.from({ length: 6 }, (_, i) => ({
  logo: { src: `/assets/images/portfolio-0${i + 1}.png`, alt: `LOGO_ALT_${i}_X` },
  title: `TITLE_${i}_X`,
  category: `CATEGORY_${i}_X`,
  description: i < 4 ? `DESC_${i}_X` : '',
}));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items };

describe('Portfolio', () => {
  test('renders all six items', () => {
    render(<Portfolio {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });

  test('renders each logo with alt text from props', () => {
    render(<Portfolio {...props} />);
    expect(screen.getByAltText('LOGO_ALT_5_X')).toBeInTheDocument();
  });

  test('renders each category', () => {
    render(<Portfolio {...props} />);
    expect(screen.getByText('CATEGORY_5_X')).toBeInTheDocument();
  });

  test('renders a disclosure only for items that have a description', () => {
    render(<Portfolio {...props} />);
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(4);
  });

  test('renders an empty state when items is empty', () => {
    render(<Portfolio {...props} items={[]} />);
    expect(screen.getByText('No projects yet. Add items to portfolio.json.')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/interactive/PortfolioRow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { PortfolioRow } from './PortfolioRow';

const item = {
  logo: { src: '/assets/images/portfolio-01.png', alt: 'LOGO_ALT_X' },
  title: 'TITLE_X',
  category: 'CATEGORY_X',
  description: 'DESC_X',
};

describe('PortfolioRow', () => {
  test('starts collapsed with aria-expanded false', () => {
    render(<PortfolioRow item={item} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking reveals the description and flips aria-expanded', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('DESC_X')).toBeVisible();
  });

  test('opens with the keyboard', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('renders no button when the description is empty', () => {
    render(<PortfolioRow item={{ ...item, description: '' }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('TITLE_X')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run both and confirm they fail**

- [ ] **Step 4: Implement**

Portfolio is an index, not a card grid: full-width rows separated by hairlines, each row laying out logo, title, and category across the width. The trigger wraps the row content and carries `aria-expanded`. Hover shifts the row background one grayscale step, which is what tells the reader the row will open.

- [ ] **Step 5: Run the tests**

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "add portfolio section with row disclosure"
```

---

## Task 20: Team

**Files:**

- Create: `src/components/sections/Team.tsx`, `src/components/interactive/TeamMember.tsx`
- Test: `src/components/sections/Team.test.tsx`, `src/components/interactive/TeamMember.test.tsx`

**Interfaces:**

- Consumes: `Team` and `UiLabels` from Task 6, `SectionHeading` from Task 13, `collapsible` from Task 19
- Produces: `<Team {...team} ui={UiLabels} />` inside `<section id="team">`, and `<TeamMember member={Team['members'][number]} ui={UiLabels} />`
- The disclosure trigger is named `${ui.expandBio} ${member.name}` when collapsed and `${ui.collapseBio} ${member.name}` when open. The member name is part of the name so that two triggers on the page are distinguishable to a screen reader.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/sections/Team.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Team } from './Team';

const members = [1, 2].map((n) => ({
  photo: { src: `/assets/images/team-0${n}.jpg`, alt: `PHOTO_ALT_${n}_X` },
  name: `NAME_${n}_X`,
  role: `ROLE_${n}_X`,
  bio: `BIO_${n}_X`,
}));
const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', members, ui };

describe('Team', () => {
  test('renders both members as h3 with role and photo alt', () => {
    render(<Team {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 3, name: 'NAME_2_X' })).toBeInTheDocument();
    expect(screen.getByText('ROLE_2_X')).toBeInTheDocument();
    expect(screen.getByAltText('PHOTO_ALT_2_X')).toBeInTheDocument();
  });

  test('renders the section with the team id', () => {
    const { container } = render(<Team {...props} />);
    expect(container.querySelector('section#team')).not.toBeNull();
  });

  test('renders an empty state when members is empty', () => {
    render(<Team {...props} members={[]} />);
    expect(screen.getByText('No team members yet. Add members to team.json.')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/interactive/TeamMember.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { TeamMember } from './TeamMember';

const member = {
  photo: { src: '/assets/images/team-01.jpg', alt: 'PHOTO_ALT_X' },
  name: 'NAME_X',
  role: 'ROLE_X',
  bio: 'BIO_X',
};

const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};

describe('TeamMember', () => {
  test('the bio is collapsed and the trigger is named from ui plus the member name', () => {
    render(<TeamMember member={member} ui={ui} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAccessibleName('EXPAND_BIO_X NAME_X');
  });

  test('activating the trigger reveals the bio and renames the trigger', async () => {
    const user = userEvent.setup();
    render(<TeamMember member={member} ui={ui} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('COLLAPSE_BIO_X NAME_X');
    expect(screen.getByText('BIO_X')).toBeVisible();
  });

  test('name and role are visible without expanding', () => {
    render(<TeamMember member={member} ui={ui} />);
    expect(screen.getByRole('heading', { level: 3, name: 'NAME_X' })).toBeInTheDocument();
    expect(screen.getByText('ROLE_X')).toBeInTheDocument();
  });
});
```

The trigger's accessible name includes the member name so that two identical `Read bio` buttons are distinguishable to a screen reader user.

- [ ] **Step 2: Run and confirm they fail**

- [ ] **Step 3: Implement**

Two members side by side at `md` and above, stacked below. Square photos, no circular crop, no drop shadow.

- [ ] **Step 4: Run the tests**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add team section with expandable bio"
```

---

## Task 21: Contact and copy button

**Files:**

- Create: `src/components/sections/Contact.tsx`, `src/components/interactive/CopyButton.tsx`
- Test: `src/components/sections/Contact.test.tsx`, `src/components/interactive/CopyButton.test.tsx`

**Interfaces:**

- Consumes: `Contact`, `ContactChannel`, and `UiLabels` from Task 6, `channelHref` from Task 8, `SectionHeading` from Task 13
- Produces: `<Contact {...contact} ui={UiLabels} />` inside `<section id="contact">`, and `<CopyButton value={string} label={string} copyLabel={string} copiedLabel={string} />`
- The copy trigger is named `${copyLabel} ${label}`, and the confirmation text is `copiedLabel`. Neither string is written in the component.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/sections/Contact.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Contact } from './Contact';

const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};

const props = {
  label: 'LABEL_X',
  headline: 'HEADLINE_X',
  ui,
  channels: [
    { type: 'email' as const, label: 'EMAIL_LABEL_X', value: 'a@placeholder.test' },
    { type: 'phone' as const, label: 'PHONE_LABEL_X', value: '+62 21 0000 0000' },
    { type: 'whatsapp' as const, label: 'WA_LABEL_X', value: '+62 812 0000 0000' },
    { type: 'address' as const, label: 'ADDRESS_LABEL_X', value: 'ADDRESS_VALUE_X' },
    { type: 'hours' as const, label: 'HOURS_LABEL_X', value: 'HOURS_VALUE_X' },
    { type: 'social' as const, label: 'SOCIAL_LABEL_X', value: 'https://social.example/x' },
  ],
};

describe('Contact', () => {
  test('renders a mailto link for email', () => {
    render(<Contact {...props} />);
    expect(screen.getByRole('link', { name: /a@placeholder.test/ })).toHaveAttribute(
      'href',
      'mailto:a@placeholder.test',
    );
  });

  test('renders tel and wa.me links with separators removed', () => {
    render(<Contact {...props} />);
    expect(screen.getByRole('link', { name: /0000 0000/ })).toHaveAttribute(
      'href',
      'tel:+622100000000',
    );
    expect(screen.getByRole('link', { name: /812 0000 0000/ })).toHaveAttribute(
      'href',
      'https://wa.me/6281200000000',
    );
  });

  test('renders address and hours as text, not links', () => {
    render(<Contact {...props} />);
    expect(screen.queryByRole('link', { name: /ADDRESS_VALUE_X/ })).not.toBeInTheDocument();
    expect(screen.getByText('ADDRESS_VALUE_X')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /HOURS_VALUE_X/ })).not.toBeInTheDocument();
    expect(screen.getByText('HOURS_VALUE_X')).toBeInTheDocument();
  });

  test('renders an address link when an explicit href is given', () => {
    const channels = [
      {
        type: 'address' as const,
        label: 'A_X',
        value: 'ADDRESS_VALUE_X',
        href: 'https://maps.example/x',
      },
    ];
    render(<Contact {...props} channels={channels} />);
    expect(screen.getByRole('link', { name: /ADDRESS_VALUE_X/ })).toHaveAttribute(
      'href',
      'https://maps.example/x',
    );
  });

  test('renders a copy button only for email, phone, and whatsapp', () => {
    render(<Contact {...props} />);
    expect(screen.getAllByRole('button', { name: /^COPY_X / })).toHaveLength(3);
  });

  test('contains no form and no input', () => {
    const { container } = render(<Contact {...props} />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  test('renders an empty state when channels is empty', () => {
    render(<Contact {...props} channels={[]} />);
    expect(
      screen.getByText('No contact channels yet. Add channels to contact.json.'),
    ).toBeInTheDocument();
  });
});
```

```tsx
// src/components/interactive/CopyButton.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CopyButton } from './CopyButton';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const labels = { copyLabel: 'COPY_X', copiedLabel: 'COPIED_X' };

describe('CopyButton', () => {
  test('is named from the labels it is given, not from the component', () => {
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    expect(screen.getByRole('button', { name: 'COPY_X LABEL_X' })).toBeInTheDocument();
  });

  test('writes the value to the clipboard and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const user = userEvent.setup();
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await user.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('VALUE_X');
    expect(await screen.findByText('COPIED_X')).toBeInTheDocument();
  });

  test('leaves the button usable when the clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const user = userEvent.setup();
    render(<CopyButton value="VALUE_X" label="LABEL_X" {...labels} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run and confirm they fail**

- [ ] **Step 3: Implement**

Contact is a definition list of channels, each row showing the mono label on the left and the value on the right, separated by hairlines. The copy confirmation is announced with `aria-live="polite"` and clears after 2000ms. The confirmation text is reserved space so its appearance shifts nothing.

- [ ] **Step 4: Run the tests**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add contact section with copyable channels"
```

---

## Task 22: Footer

**Files:**

- Create: `src/components/sections/Footer.tsx`
- Test: `src/components/sections/Footer.test.tsx`

**Interfaces:**

- Consumes: `Site` and `ContactChannel` from Task 6, `channelHref` from Task 8
- Produces: `<Footer logo={Site['logo']} nav={Site['footer']['nav']} copyright={string} social={ContactChannel[]} />`. The `social` array is filtered by `page.tsx` in Task 24, so Footer itself does no filtering and stays a pure renderer.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/sections/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Footer } from './Footer';

const props = {
  logo: { wordmark: 'WORDMARK_X' },
  nav: [{ label: 'FOOTER_NAV_X', href: '#services' }],
  copyright: 'COPYRIGHT_X',
  social: [
    { type: 'social' as const, label: 'SOCIAL_ONE_X', value: 'https://social.example/one' },
    { type: 'social' as const, label: 'SOCIAL_TWO_X', value: 'https://social.example/two' },
  ],
};

describe('Footer', () => {
  test('is a contentinfo landmark', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders wordmark, nav, and copyright from props', () => {
    render(<Footer {...props} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FOOTER_NAV_X' })).toHaveAttribute('href', '#services');
    expect(screen.getByText('COPYRIGHT_X')).toBeInTheDocument();
  });

  test('renders one link per social channel', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('link', { name: 'SOCIAL_TWO_X' })).toHaveAttribute(
      'href',
      'https://social.example/two',
    );
  });

  test('renders no social block when the list is empty', () => {
    render(<Footer {...props} social={[]} />);
    expect(screen.queryByRole('link', { name: 'SOCIAL_ONE_X' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

`<footer>` on an ink background, the one full inversion on the page, so the document has a clear bottom edge. Wordmark on the left at display size, the secondary nav and the social links in mono uppercase on the right, copyright on its own line beneath a hairline. Social links use `channelHref(channel.type, channel.value, channel.href)` and carry `rel="noreferrer"` with `target="_blank"`, because they leave the site. The social block renders nothing at all when the array is empty, rather than an empty list element.

- [ ] **Step 4: Run the test**

```bash
pnpm test src/components/sections/Footer.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add footer section"
```

---

## Task 23: Hardcoded text scanner

**Files:**

- Create: `src/components/sections/no-hardcoded-text.test.ts`

**Interfaces:**

- Consumes: every file under `src/components/sections/` and `src/components/interactive/`
- Produces: a failing test the moment somebody types display copy into JSX

This is one half of the zero-hardcoded-text proof. The other half is the sentinel fixtures already used in Tasks 14 through 22. The interactive directory is scanned too, because the control labels moved into `site.ui` precisely so those components would hold none.

`src/components/ui/` is excluded: it is generated shadcn output, and its files carry no display copy of their own.

- [ ] **Step 1: Write the test**

```ts
// src/components/sections/no-hardcoded-text.test.ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const DIRS = ['src/components/sections', 'src/components/interactive'];

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
  test.each(files)('%s', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    // Text sitting directly between JSX tags, ignoring expressions and whitespace.
    const between = source.match(/>[^<>{}\n]*[A-Za-z]{2,}[^<>{}]*</g) ?? [];
    const offenders = between
      .map((match) => match.slice(1, -1).trim())
      .filter((text) => text.length > 0 && !ALLOWED.has(text));
    expect(offenders).toEqual([]);
  });
});
```

The regex catches text between tags. It does not catch a literal in a prop such as `aria-label="Menu"`, so add this second test in the same file:

```ts
describe('components carry no literal aria-label or title', () => {
  test.each(files)('%s', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toMatch(/(aria-label|title|alt)="[^"]*[A-Za-z]{2,}[^"]*"/);
  });
});
```

- [ ] **Step 2: Run it**

```bash
pnpm test src/components/sections/no-hardcoded-text.test.ts
```

Expected: PASS. If it fails, the named file has literal copy that belongs in JSON. Move it, do not widen `ALLOWED`. The only legitimate additions to `ALLOWED` are new empty-state strings.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "add scanner test rejecting display copy in section components"
```

---

## Task 24: Page assembly and metadata

**Execute this after Tasks 25 and 26.** The page below imports `Reveal` and `ScrollState`, which Task 25 creates. It is numbered 24 because it is the clearest place to see the whole page, not because it comes first.

**Files:**

- Create: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Test: covered by E2E in Task 27, because `page.tsx` is an async Server Component and Vitest cannot render those

**Interfaces:**

- Consumes: `loadSection` from Task 7, `sectionSchemas` from Task 6, all nine section components
- Produces: the rendered page, and `generateMetadata` sourcing title, description, and OG image from `site.json`

- [ ] **Step 1: Write `src/app/page.tsx`**

```tsx
import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Purpose } from '@/components/sections/Purpose';
import { Services } from '@/components/sections/Services';
import { Portfolio } from '@/components/sections/Portfolio';
import { Team } from '@/components/sections/Team';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { Reveal } from '@/components/interactive/Reveal';
import { ScrollState } from '@/components/interactive/ScrollState';
import { loadSection } from '@/lib/content/loader';
import { sectionSchemas } from '@/lib/content/schema';

export default async function Page() {
  const [site, hero, about, purpose, services, portfolio, team, contact] = await Promise.all([
    loadSection('site', sectionSchemas.site),
    loadSection('hero', sectionSchemas.hero),
    loadSection('about', sectionSchemas.about),
    loadSection('purpose', sectionSchemas.purpose),
    loadSection('services', sectionSchemas.services),
    loadSection('portfolio', sectionSchemas.portfolio),
    loadSection('team', sectionSchemas.team),
    loadSection('contact', sectionSchemas.contact),
  ]);

  const social = contact.channels.filter((channel) => channel.type === 'social');

  return (
    <>
      <ScrollState />
      <Navbar logo={site.logo} nav={site.nav} cta={site.cta} ui={site.ui} />
      <main>
        <Hero {...hero} />
        <Reveal>
          <About {...about} />
        </Reveal>
        <Reveal>
          <Purpose {...purpose} />
        </Reveal>
        <Reveal>
          <Services {...services} />
        </Reveal>
        <Reveal>
          <Portfolio {...portfolio} />
        </Reveal>
        <Reveal>
          <Team {...team} ui={site.ui} />
        </Reveal>
        <Reveal>
          <Contact {...contact} ui={site.ui} />
        </Reveal>
      </main>
      <Footer
        logo={site.logo}
        nav={site.footer.nav}
        copyright={site.footer.copyright}
        social={social}
      />
    </>
  );
}
```

Hero is deliberately outside `Reveal`. It is above the fold, so hiding it behind an observer would delay the first thing the reader sees.

- [ ] **Step 2: Replace the static metadata in `src/app/layout.tsx`**

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSection('site', sectionSchemas.site);
  return {
    title: site.meta.title,
    description: site.meta.description,
    openGraph: {
      title: site.meta.title,
      description: site.meta.description,
      images: site.meta.ogImage.src
        ? [{ url: site.meta.ogImage.src, alt: site.meta.ogImage.alt }]
        : [],
    },
  };
}
```

The same `fetch` runs in both `generateMetadata` and `Page`, and Next memoizes identical GET requests within one render pass, so `site.json` is read once.

- [ ] **Step 3: Build and look at the page**

```bash
pnpm build && pnpm start
```

Open `http://localhost:3000` and confirm all nine sections render.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "assemble the page and source metadata from site.json"
```

---

## Task 25: Reveal and scroll state

**Files:**

- Create: `src/components/interactive/Reveal.tsx`, `src/components/interactive/ScrollState.tsx`
- Test: `src/components/interactive/Reveal.test.tsx`

**Interfaces:**

- Consumes: the CSS baseline from Task 11
- Produces: `<Reveal>{children}</Reveal>` and `<ScrollState />`

`ScrollState` sets `data-scrolled` on the root element. The navbar reacts by fading in a background and a bottom hairline. The navbar height never changes, because changing it would animate a layout property and shift everything below it.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/interactive/Reveal.test.tsx
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Reveal } from './Reveal';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reveal', () => {
  test('renders its children', () => {
    render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(screen.getByText('CHILD_X')).toBeInTheDocument();
  });

  test('starts in the pending state and carries the data-reveal attribute', () => {
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'pending');
  });

  test('switches to shown when the observer reports an intersection', () => {
    let trigger: ((entries: unknown[]) => void) | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    trigger?.([{ isIntersecting: true }]);
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });

  test('shows immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement `Reveal`**

```tsx
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={shown ? 'shown' : 'pending'}>
      {children}
    </div>
  );
}
```

The attribute is always present. `pending` is what the `scripting: enabled` block hides, so a browser with JS disabled never reaches that state and the content stays visible.

- [ ] **Step 4: Implement `ScrollState`**

```tsx
'use client';

import { useEffect } from 'react';

export function ScrollState() {
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return null;
}
```

- [ ] **Step 5: Add the navbar reaction to `globals.css`**

```css
header[data-nav] {
  height: var(--nav-h);
  background: transparent;
  transition: background var(--duration-base) var(--ease-in-out);
}

html[data-scrolled='true'] header[data-nav] {
  background: var(--color-paper);
  border-bottom: 1px solid var(--color-ash);
}
```

Set `data-nav` on the `header` in `Navbar.tsx`. A border appearing on a fixed element that is already `--nav-h` tall shifts nothing below it.

- [ ] **Step 6: Run the tests**

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "add reveal wrapper and scroll state"
```

---

## Task 26: Active section indicator

**Files:**

- Create: `src/components/interactive/NavLinks.tsx`
- Modify: `src/components/sections/Navbar.tsx`
- Test: `src/components/interactive/NavLinks.test.tsx`

**Interfaces:**

- Consumes: `Site['nav']` from Task 6
- Produces: `<NavLinks nav={Site['nav']} />`. The link whose section is in view carries `aria-current="location"`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/interactive/NavLinks.test.tsx
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { NavLinks } from './NavLinks';

const nav = [
  { label: 'ABOUT_X', href: '#about' },
  { label: 'SERVICES_X', href: '#services' },
];

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('NavLinks', () => {
  test('renders one link per item', () => {
    render(<NavLinks nav={nav} />);
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).toHaveAttribute('href', '#about');
  });

  test('no link is current before any section is observed', () => {
    render(<NavLinks nav={nav} />);
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
  });

  test('marks the link whose section is intersecting', () => {
    document.body.innerHTML = '<section id="about"></section><section id="services"></section>';
    let trigger: ((entries: unknown[]) => void) | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<NavLinks nav={nav} />);
    trigger?.([
      {
        isIntersecting: true,
        target: document.getElementById('services'),
        boundingClientRect: { top: 10 },
      },
    ]);
    expect(screen.getByRole('link', { name: 'SERVICES_X' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

- [ ] **Step 3: Implement**

```tsx
'use client';

import { useEffect, useState } from 'react';

type NavItem = { label: string; href: string };

export function NavLinks({ nav }: { nav: NavItem[] }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = nav
      .map((item) => document.getElementById(item.href.replace('#', '')))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [nav]);

  return (
    <ul className="flex items-center gap-6">
      {nav.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-current={active === item.href.replace('#', '') ? 'location' : undefined}
            className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] aria-[current]:text-ink text-graphite transition-colors duration-[var(--duration-fast)]"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

The `-30% 0px -60% 0px` root margin narrows the observation band to a strip near the top of the viewport, so exactly one section is active at a time instead of every section that happens to be on screen.

- [ ] **Step 4: Swap the plain anchors in `Navbar.tsx` for `<NavLinks nav={nav} />` and re-run the Navbar tests**

The Navbar tests from Task 14 must still pass unchanged, since they only assert link names and hrefs.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add active section indicator to the navbar"
```

---

## Task 27: End to end structure and responsiveness

**Files:**

- Create: `e2e/structure.spec.ts`
- Modify: `e2e/smoke.spec.ts` is replaced by this file, delete it

**Interfaces:**

- Consumes: the built app
- Produces: coverage of the nine sections, anchor navigation, and the three viewports

- [ ] **Step 1: Write the spec**

```ts
// e2e/structure.spec.ts
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

test('anchor navigation lands below the navbar', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: /menu/i }).click();
  }
  await page.getByRole('link', { name: 'Services', exact: true }).first().click();
  await expect(page.locator('section#services')).toBeInViewport();
  const navHeight = await page
    .getByRole('banner')
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
```

- [ ] **Step 2: Run across all three projects**

```bash
pnpm test:e2e e2e/structure.spec.ts
rm e2e/smoke.spec.ts
```

Expected: green on mobile, tablet, and desktop. Paste the summary.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "add end to end structure and responsive specs"
```

---

## Task 28: Accessibility, keyboard, and motion

**Files:**

- Create: `e2e/a11y.spec.ts`, `e2e/motion.spec.ts`

**Interfaces:**

- Consumes: the built app, `@axe-core/playwright`
- Produces: proof of zero serious or critical axe violations, a keyboard journey, distinct focus and hover states, and reduced motion behaviour

- [ ] **Step 1: Write `e2e/a11y.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('no serious or critical axe violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
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

test('focus and hover are visually different', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('banner').getByRole('link').last();
  await cta.hover();
  const hover = await cta.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineWidth, background: style.backgroundColor };
  });
  await cta.focus();
  const focus = await cta.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineWidth, background: style.backgroundColor };
  });
  expect(hover.outline).toBe('0px');
  expect(focus.outline).not.toBe('0px');
});

test('disclosures work with the keyboard and report their state', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('#portfolio [aria-expanded]').first();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});
```

- [ ] **Step 2: Write `e2e/motion.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('all content is visible and no transition runs under reduced motion', async ({ page }) => {
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

test('content is visible before any observer fires', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('section#contact')).toBeVisible();
  await expect(page.locator('#services h3')).toHaveCount(12);
  await context.close();
});
```

The second test is the proof that the reveal baseline holds without JS. It is the one that fails if somebody moves the hidden state out of the `scripting: enabled` block.

- [ ] **Step 3: Run both**

```bash
pnpm test:e2e e2e/a11y.spec.ts e2e/motion.spec.ts
```

Paste the summary, including the axe violation list if it is not empty.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "add accessibility keyboard and reduced motion specs"
```

---

## Task 29: Content resilience end to end

**Files:**

- Create: `e2e/fixture-server.mjs`, `e2e/fixtures/broken/*.json`, `e2e/fixtures/live/*.json`, `playwright.resilience.config.ts`, `e2e/resilience.spec.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `CONTENT_BASE_URL` and `CONTENT_REVALIDATE` from Task 7
- Produces: proof that broken JSON does not blank the page, and that content served over HTTP changes what renders without a rebuild

- [ ] **Step 1: Write the fixture server**

```js
// e2e/fixture-server.mjs
// Serves e2e/fixtures/<set>/ over HTTP so the app can be pointed at content
// that is not part of the build. Set FIXTURE_SET to choose the directory.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const set = process.env.FIXTURE_SET ?? 'live';
const root = join(process.cwd(), 'e2e/fixtures', set);

createServer(async (request, response) => {
  const name = (request.url ?? '/').split('?')[0].replace(/^\//, '');
  try {
    const body = await readFile(join(root, name), 'utf8');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(body);
  } catch {
    response.writeHead(404).end('{}');
  }
}).listen(4321, () => console.log(`fixtures: ${root} on 4321`));
```

- [ ] **Step 2: Create the two fixture sets**

`e2e/fixtures/live/` is a copy of `public/data/` with every headline suffixed `LIVE_FIXTURE`, so a test can tell which source the page is reading.

```bash
mkdir -p e2e/fixtures/live e2e/fixtures/broken
cp public/data/*.json e2e/fixtures/live/
```

Then edit `e2e/fixtures/live/hero.json` so `headline` reads `LIVE_FIXTURE_HEADLINE`.

`e2e/fixtures/broken/` holds deliberately damaged files:

- `site.json` truncated mid-object so `JSON.parse` throws: `{"meta": {"title": "x"`
- `services.json` with `items` set to the string `"not an array"`
- `hero.json` with `headline` set to `42`
- `contact.json` with one channel of type `carrier-pigeon`
- `portfolio.json`, `team.json`, `about.json`, `purpose.json` copied unchanged from `public/data/`

- [ ] **Step 3: Write `playwright.resilience.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /resilience\.spec\.ts/,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3100', ...devices['Desktop Chrome'] },
  webServer: [
    {
      command: `FIXTURE_SET=${process.env.FIXTURE_SET ?? 'live'} node e2e/fixture-server.mjs`,
      url: 'http://localhost:4321/site.json',
      reuseExistingServer: false,
    },
    {
      command:
        'CONTENT_BASE_URL=http://localhost:4321 CONTENT_REVALIDATE=0 pnpm build && ' +
        'CONTENT_BASE_URL=http://localhost:4321 CONTENT_REVALIDATE=0 pnpm start -p 3100',
      url: 'http://localhost:3100',
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
```

- [ ] **Step 4: Write `e2e/resilience.spec.ts`**

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

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

test('a broken services array falls back to the empty state', async ({ page }) => {
  test.skip(process.env.FIXTURE_SET !== 'broken', 'broken fixtures only');
  await page.goto('/');
  await expect(page.getByText('No services yet. Add items to services.json.')).toBeVisible();
});
```

- [ ] **Step 5: Add scripts**

```json
{
  "scripts": {
    "test:e2e:live": "playwright test --config playwright.resilience.config.ts",
    "test:e2e:broken": "FIXTURE_SET=broken playwright test --config playwright.resilience.config.ts"
  }
}
```

- [ ] **Step 6: Run both and paste the output**

```bash
pnpm test:e2e:live
pnpm test:e2e:broken
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "add resilience specs for broken json and http-sourced content"
```

---

## Task 30: Visual regression and performance budget

**Files:**

- Create: `e2e/visual.spec.ts`, `.lighthouserc.json`
- Modify: `package.json`

`playwright.config.ts` needs no change. `e2e/visual.spec.ts` sits in the existing `testDir`, and the `test.skip(!process.env.VISUAL)` guard is what keeps it out of ordinary and CI runs.

**Interfaces:**

- Consumes: the built app
- Produces: per-section screenshot baselines at three viewports, and a Lighthouse run asserting the four budgets

Playwright names snapshots per platform, so baselines taken on macOS do not match a Linux runner. Visual specs therefore run behind a `VISUAL=1` flag and stay out of CI. The CI gate is lint, typecheck, unit, build, and the functional E2E suites.

- [ ] **Step 1: Write `e2e/visual.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test.skip(!process.env.VISUAL, 'set VISUAL=1 to run visual regression');

const SECTIONS = ['about', 'purpose', 'services', 'portfolio', 'team', 'contact'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('hero matches the baseline', async ({ page }) => {
  await expect(page.locator('main > :first-child')).toHaveScreenshot('hero.png');
});

for (const id of SECTIONS) {
  test(`${id} matches the baseline`, async ({ page }) => {
    const section = page.locator(`section#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveScreenshot(`${id}.png`);
  });
}
```

`reducedMotion: 'reduce'` is set so the reveal transition cannot make a screenshot flaky.

- [ ] **Step 2: Generate the baselines**

```bash
VISUAL=1 pnpm test:e2e e2e/visual.spec.ts --update-snapshots
VISUAL=1 pnpm test:e2e e2e/visual.spec.ts
```

Expected: the second run is green with 21 comparisons, seven per viewport.

- [ ] **Step 3: Add the Lighthouse budget**

```bash
pnpm add -D @lhci/cli
```

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouse" }
  }
}
```

```json
{ "scripts": { "test:lighthouse": "pnpm build && lhci autorun" } }
```

- [ ] **Step 4: Run it and paste the score table**

```bash
pnpm test:lighthouse
```

If a budget fails, fix the cause in Task 31 and re-run. Do not lower the budget.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "add visual regression baselines and lighthouse budget"
```

---

## Task 31: Optimisation pass

**Files:**

- Modify: image usages across section components, `next.config.ts`, `package.json`

**Interfaces:**

- Consumes: the Lighthouse report from Task 30
- Produces: the same behaviour at a lower cost, with every test still green

- [ ] **Step 1: Confirm every image goes through `next/image`**

```bash
grep -rn "<img" src/ || echo "no raw img tags"
```

Expected: no raw `img` tags. Hero uses `priority`; portfolio logos and team photos use the default lazy loading with explicit `width` and `height` so no layout shift occurs while they load.

- [ ] **Step 2: Confirm the image formats**

In `next.config.ts`:

```ts
const nextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
};
export default nextConfig;
```

- [ ] **Step 3: Check for unused dependencies**

```bash
pnpm dlx depcheck
```

Remove anything reported as unused, then re-run `pnpm test && pnpm build`.

- [ ] **Step 4: Confirm only the three font families load**

```bash
pnpm build
grep -rn "fonts.gstatic\|font-face" .next/static/css/*.css | head -20
```

Expected: only Bodoni Moda, Archivo, and IBM Plex Mono, latin subset.

- [ ] **Step 5: Re-run every gate**

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e && pnpm test:lighthouse
```

Paste all outputs.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "optimise images fonts and dependencies"
```

---

## Task 32: Documentation

**Files:**

- Create: `docs/EDITING-CONTENT.md`
- Modify: `README.md`

**Interfaces:**

- Consumes: `ICON_NAMES` from Task 9, the ratios from Task 10
- Produces: instructions a non-technical editor can follow without opening a code file

`docs/EDITING-CONTENT.md` is written in Indonesian. `README.md` is written in English.

- [ ] **Step 1: Write `docs/EDITING-CONTENT.md`**

It must cover, each with a concrete before and after example naming the file and the key:

1. Changing text: which file, which key, one worked example per section.
2. Changing an image: the folder, the file name, and the required pixel size and ratio for each of the three slots.
3. Adding and removing items in `services.json`, `portfolio.json`, and `team.json`, including the item counts the layout expects.
4. The complete list of icon names, generated from `ICON_NAMES` rather than typed by hand.
5. Adding and removing contact channels, with the six valid `type` values and what each one produces.
6. What must not change: key names, the array structure, and the `href` values in `site.json` `nav`, which have to keep matching the section ids.
7. How to check the JSON is valid before uploading, with a link to a JSON validator.
8. Troubleshooting, with at least these three: a section disappeared, an icon turned into a dashed circle, a contact link goes nowhere. Each answer names the file, the key, and the fix.

- [ ] **Step 2: Write `README.md`**

Setup, the script list with what each one gates, the directory structure, and the architecture decisions with their reasons: runtime JSON fetch, `revalidate: 60`, fallback over failure, `CONTENT_BASE_URL`, and why the visual regression suite is not in CI.

- [ ] **Step 3: Run Gate C in detect mode first**

Read `README.md`, `docs/EDITING-CONTENT.md`, every string in `public/data/*.json`, and every alt text, hunting for the patterns in `docs/spec.md` and the prompt's section 5.3. Report each hit with its quoted line before editing anything. The detection report is a deliverable.

```bash
grep -rniE "delve|foster|leverage|utilize|facilitate|empower|streamline|robust|cutting-edge|paradigm shift|game changer|seamless|elevate|embark|harness|transformative|ever-evolving|meticulous|intricate|multifaceted" --include="*.md" --include="*.json" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Expected: exactly two hits, both inside `docs/plan.md`, being the constraint list on line 27 and the grep command itself. Anything else is a real hit and must be rewritten. Paste the command and its full result either way.

- [ ] **Step 4: Fix what the detection report found, then commit**

```bash
git add -A
git commit -m "add editing guide and readme"
```

---

## Task 33: Review gates

**Files:**

- Modify: whatever the reviews turn up

**Interfaces:**

- Consumes: the finished UI
- Produces: audit findings and the fixes for them

- [ ] **Step 1: Run the over-engineering audits**

Use `ponytail:ponytail-audit` and `ponytail:ponytail-debt`. Record every `ponytail:` comment left in the code as a ledger entry in the report.

- [ ] **Step 2: Run the code review**

Use `ponytail:ponytail-review` and `superpowers:requesting-code-review`. Respond with `superpowers:receiving-code-review`.

- [ ] **Step 3: Run Gate B**

Screenshot each section at 1440px. For each one, remove a single decorative element, rebuild, and look again. Report which removals cost nothing; leave those elements removed. Report which ones mattered and why.

- [ ] **Step 4: Re-run every gate and commit the fixes**

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm test:e2e
```

Coverage must show `src/lib/content/` at 100% branch and `src/components/` at 90% statement or better.

---

## Task 34: Deploy and verify

**Files:**

- Create: `vercel.json` only if a setting genuinely needs it

**Interfaces:**

- Consumes: the verified build
- Produces: a live URL with the same specs passing against it

- [ ] **Step 1: Deploy**

```bash
pnpm dlx vercel@latest --prod
```

Preview deployments for pull requests are on by default once the repository is linked.

- [ ] **Step 2: Verify the runtime fetch works in production**

Open the deployed URL, confirm the content renders, then change one string in `public/data/hero.json`, push, and confirm the deployed page picks it up.

- [ ] **Step 3: Run the functional specs against production**

```bash
E2E_BASE_URL=https://<deployment-url> pnpm test:e2e e2e/structure.spec.ts e2e/a11y.spec.ts
```

Paste the summary.

- [ ] **Step 4: Final verification**

Use `superpowers:verification-before-completion`. Walk the definition of done in the original brief item by item, and for each one paste the command and its output. Anything that cannot be evidenced is reported as not done.

- [ ] **Step 5: Finish the branch**

Use `superpowers:finishing-a-development-branch`.

---

## Notes for the executor

- Tasks 1 to 12 are strictly sequential. Task 13 must land before Tasks 14 to 22.
- Tasks 15 to 22 touch disjoint files and can be worked in parallel. Task 14 and Task 19 each add a shadcn component and both edit `globals.css`, so run those two one after the other rather than at the same time.
- Tasks 24 to 26 depend on every section existing. Inside that group the order is 25, then 26, then 24, because the page assembled in Task 24 imports the two client components built in Task 25.
- If a test fails for a reason the plan did not predict, use `superpowers:systematic-debugging` rather than adjusting the test until it passes.
