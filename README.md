# hca-company-profile

A nine-section company profile site built with Next.js 16, React 19,
TypeScript, and Tailwind CSS 4. Every section is a Server Component; all
display copy and images come from JSON files fetched at runtime rather than
imported at build time.

- Editing the copy in `public/data/*.json`? Read `docs/EDITING-CONTENT.md`
  (Indonesian, no code or command-line knowledge required).
- Working on the design tokens, the content-loading pipeline, or the test
  suite's scanning rules? Read `docs/ARCHITECTURE.md`.

## Setup

```bash
pnpm install
pnpm dev
```

Requires Node 22 and pnpm 11 (`packageManager` in `package.json` pins
`pnpm@11.9.0`; CI installs pnpm 11 and Node 22). `pnpm dev` serves the site at
`http://localhost:3000`.

## Scripts

| Script                 | Command                                                                       | What it gates                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`             | `next dev`                                                                    | Local development server on port 3000                                                                                                                                                                        |
| `pnpm build`           | `next build`                                                                  | Production build                                                                                                                                                                                             |
| `pnpm start`           | `next start`                                                                  | Runs a production build that was already built                                                                                                                                                               |
| `pnpm lint`            | `eslint .`                                                                    | Lint rules (run in CI)                                                                                                                                                                                       |
| `pnpm typecheck`       | `next typegen && tsc --noEmit`                                                | Type-checks the project, including Next's generated route types (run in CI)                                                                                                                                  |
| `pnpm format`          | `prettier --write .`                                                          | Formats the repository (not run in CI; `prettier --check .` is a local gate before committing)                                                                                                               |
| `pnpm test`            | `vitest run`                                                                  | Unit tests: schemas, the content loader, `channelHref`, the icon registry, every section component, and the source-scanning conventions described in `docs/ARCHITECTURE.md` (run in CI)                      |
| `pnpm test:watch`      | `vitest`                                                                      | Unit tests in watch mode                                                                                                                                                                                     |
| `pnpm test:coverage`   | `vitest run --coverage`                                                       | Unit tests with a v8 coverage report over `src/lib` and `src/components` (local-only; not run in CI)                                                                                                         |
| `pnpm test:e2e`        | `playwright test`                                                             | Structure, keyboard/scroll motion, and accessibility (axe) specs against a production build served on port 3300; the visual-regression spec in this same run is skipped unless `VISUAL=1` is set (run in CI) |
| `pnpm test:e2e:live`   | `playwright test --config playwright.resilience.config.ts`                    | Resilience specs against a local fixture server serving well-formed JSON, port 3100 (run in CI)                                                                                                              |
| `pnpm test:e2e:broken` | `FIXTURE_SET=broken playwright test --config playwright.resilience.config.ts` | The same resilience specs against a fixture server serving malformed JSON, proving the fallback layer actually holds (run in CI)                                                                             |
| `pnpm test:lighthouse` | `pnpm build && lhci autorun`                                                  | Lighthouse CI against a production build on port 3200, budgets in `.lighthouserc.json` (run in CI)                                                                                                           |

Check `.github/workflows/ci.yml` for the exact list and order CI runs things
in, since that file is the source of truth and can move ahead of this table.

## Directory structure

```
docs/                                Documentation (this file's siblings)
e2e/                                 Playwright specs, fixtures, and visual baselines
public/
  assets/images/                     Placeholder photography — see docs/EDITING-CONTENT.md
  data/*.json                        The eight content files fetched at runtime
scripts/
  generate-placeholders.mjs          One-off script that generated public/assets/images
src/
  app/                               Root layout, home page, dev-only /styleguide, tokens.test.ts
  components/
    sections/                        Nine Server Components, one per page section
    interactive/                     Six client islands (nav, reveal, disclosures, copy button)
    ui/                              Generated shadcn primitives (button, sheet, collapsible)
  lib/
    content/                         Zod schemas, the runtime loader, channelHref
    icons.ts                         Curated lucide-react icon registry
playwright.config.ts                 E2E config (port 3300)
playwright.resilience.config.ts      Resilience config (port 3100)
.lighthouserc.json                   Lighthouse budgets (port 3200)
.github/workflows/ci.yml             CI pipeline
```

## Architecture decisions

| Decision                                                                                                 | Reason                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content is fetched at runtime (`loadSection` in `src/lib/content/loader.ts`), not imported at build time | The eight JSON files under `public/data/` can change after the app is already deployed, without a rebuild                                                                                                                                                                                                                                   |
| `next: { revalidate: 60 }` on every content fetch                                                        | A content edit is visible within 60 seconds while pages still serve from cache, which is what keeps the Lighthouse performance budget reachable; overridable per-request with `CONTENT_REVALIDATE`                                                                                                                                          |
| `CONTENT_BASE_URL` resolves the fetch origin                                                             | `fetch` on the server rejects relative URLs, so an explicit base is required; it also lets the E2E resilience specs point the app at a local fixture server instead of `public/data/`                                                                                                                                                       |
| Fallback over failure                                                                                    | Every schema field has a default; a fetch failure, invalid JSON, or a wrong-shaped field falls back to a safe default and logs a warning instead of taking the page down. Full behavior table and the mechanism behind it are in `docs/ARCHITECTURE.md`                                                                                     |
| The visual-regression spec (`e2e/visual.spec.ts`) is not run in CI                                       | Its baselines are macOS screenshots (`e2e/visual.spec.ts-snapshots/*-darwin.png`), but CI runs on `ubuntu-latest`; font rendering differs enough between the two that comparing against a macOS baseline on Linux would fail on every run regardless of any real change. The spec self-skips unless `VISUAL=1` is set, and CI never sets it |

See `docs/ARCHITECTURE.md` for the design token layer, the reasoning behind
the port scheme used across the three server configs, and what each
source-scanning test enforces.
