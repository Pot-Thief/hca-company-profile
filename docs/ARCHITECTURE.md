# Architecture

This document covers what `README.md` and `docs/EDITING-CONTENT.md`
deliberately leave out: the design token layer, why the test suite is shaped
the way it is, the port scheme across the three server configs, and the
mechanics of the content pipeline's fallback behavior.

## The token layer

`src/app/globals.css` declares two layers of colour.

The **palette** is six neutral values, from lightest to darkest: `paper`,
`mist`, `ash`, `graphite`, `ink`, `void`. Every one of them has R equal to G
equal to B — `tokens.test.ts` parses every hex literal in the file and
rejects any with a nonzero channel spread, so a hue cannot enter the palette
even slightly.

The **semantic layer** is what components actually read: `--color-surface`,
`--color-on-surface`, `--color-on-surface-muted`, `--color-rule`, and
`--color-signal`. These map onto the palette (`surface` → `paper`,
`on-surface` → `ink`, and so on), and a `[data-surface='ink']` selector
remaps all five at once, swapping the whole section from light-on-dark to
dark-on-light. Components never write `bg-ink` or `text-graphite` directly —
they write `bg-surface`, `text-on-surface`, `text-on-surface-muted`,
`border-rule`, `bg-signal`, or `text-signal`, so a section's entire colour
set flips off of one `data-surface` attribute rather than a change in every
child.

There are exactly two exceptions, both recorded in the scanner itself: the
hero's photo overlay (`bg-ink/60`) and the mobile sheet's scrim
(`bg-void/10`). Both darken what sits behind them rather than painting a
surface, so both are tied to a value on purpose — a scrim that inverted with
the theme would stop being a scrim.

**Why `void` is reserved exclusively for `signal`.** Of the five semantic
tokens, `void` is only ever assigned to one: `signal`, the single accent used
for the primary call to action. On a paper section, `signal` resolves to
`void` — pure black, the maximum-contrast value against a near-white surface.
Inside an ink section, the override swaps `signal` to `paper` instead,
the maximum-contrast value against near-black. Because `signal` is the only
token that ever touches `void`, and it always trades `void` for `paper` (or
back), the one accent on the page is always sitting at whichever end of the
grayscale ramp is furthest from its own surface — never a mid-grey that
would read close in value to its background. It also means the accent never
needs a colour value of its own: it borrows from the same six already-vetted
neutrals everything else uses, so the monochrome guard's zero-channel-spread
rule holds for the whole system without a special case for the one colour
most likely to tempt a brand hue in.

## Why the ink override has no alias layer

A CSS custom property that indirects through another one is substituted
where it is _declared_, not where it is read. Concretely: if `:root` declared
`--surface: var(--color-surface);`, that computed value would be fixed at
`:root`'s own value of `--color-surface` (`paper`, since `:root` never
carries `data-surface='ink'`) and inherited as-is down the tree. An element
further down with `data-surface='ink'` would correctly see the ink value if
it read `--color-surface` directly, but it would inherit the _frozen_ value
of `--surface` unchanged, because nothing redeclares `--surface` at that
element — it never even re-checks `--color-surface`.

This project shipped that exact bug once: with an alias layer in place, an
ink section rendered ink-coloured text on an ink background, invisible,
because the alias froze at the root's paper-surface value while the
override underneath it changed correctly. Inspecting the underlying
`--color-on-surface` variable on the element showed the right value; the
rendered text did not reflect it, because it was reading the frozen alias
instead. The fix was to remove the alias and have both the base declaration
and the `[data-surface='ink']` override write to the exact same custom
property names that the utility classes consume — no indirection in between.
`tokens.test.ts` guards against the alias names (`--surface:`,
`--on-surface:`, `--on-surface-muted:`, `--rule:`) reappearing in
`globals.css`.

## What each scanning test enforces

**`src/app/tokens.test.ts`.** Confirms every required custom property is
declared, the palette stays strictly neutral, no colour arrives through a
notation that can carry hue (`oklch`, `hsl`, `rgb`, and so on), the ink
override remaps every semantic colour rather than a subset, and the alias
layer described above stays gone. It also checks every file in
`src/components/ui/` (the generated shadcn primitives) for a colour function
or a raw hex value. It exists because a hex-only check once missed an entire
`oklch`-based theme that shadcn silently wrote into `globals.css` when a
component was added — checking for hex literals alone would not have caught
a colour value written in a different notation.

**`src/components/data-block-convention.test.ts`.** Scans `sections/` and
`interactive/` for every `data-block="NAME"` attribute a component sets, and
requires that name to appear at least twice in that component's own test
file — once asserting the block is present when it should render, once
asserting it is absent when it should not. It exists because, per its own
comment, stating that convention in prose was missed four times in a row: a
component's tests checked that a block appeared, but never checked that it
correctly disappeared in the corresponding empty-state case.

**`src/components/semantic-colour-convention.test.ts`.** Scans `sections/`
and `interactive/` for a Tailwind utility that pairs a colour-carrying prefix
(`bg-`, `text-`, `border-`, and so on) directly with a palette name (`paper`,
`mist`, `ash`, `graphite`, `ink`, `void`), which the semantic layer above
exists specifically to make unnecessary. One exception is allowed:
`Hero.tsx`'s `bg-ink`, which darkens a background photograph rather than
painting a section surface. It exists because the navbar and the mobile nav
panel named palette colours directly in six places for the life of the
project, invisibly, since the rendered result happened to be correct — it
only stayed correct because those two components never had to sit on an ink
surface. The scanner then repeated the mistake at one remove: it excluded
`src/components/ui/`, where the menu button and that same sheet held seven
more, and reported clean the whole time. That directory is in scope now.

**`src/components/sections/no-hardcoded-text.test.ts`.** Two checks. The
first strips comments from every file in `sections/` and `interactive/` and
looks for text sitting directly between JSX tags, allowing only the five
literal empty-state strings (`"No services yet. Add items to services.json."`
and its four counterparts) that cannot come from content because they are
what renders when content is missing. The second looks for a literal,
non-empty `aria-label`, `title`, or `alt` attribute value. This exists as the
second half of the zero-hardcoded-copy proof — the first half being that
every section test renders unique sentinel values and asserts those specific
values appear in the DOM — because the sentinel-fixture method alone missed
a literal `"Get in touch"` string that had been hardcoded into the navbar; a
static scan of the source text catches what a fixture-based render test does
not exercise.

## The port scheme

`next dev` keeps port 3000. E2E (`playwright.config.ts`) uses 3300.
Lighthouse (`.lighthouserc.json`) uses 3200. The resilience specs
(`playwright.resilience.config.ts`) use 3100.

This is not arbitrary. Playwright's `reuseExistingServer` option reuses
whatever process already answers on the configured port instead of starting
a new one — a genuine convenience for local iteration, since it means not
rebuilding on every test run. When the E2E config's port was 3000, that
convenience meant `reuseExistingServer` would just as happily reuse a
developer's `next dev` process as its own production build, with no way to
tell the two apart. The suite then silently measured the dev server:
Lighthouse scored it 0.84 against unminified, HMR-instrumented JavaScript
(the budget is 0.90), and the visual regression baselines were captured with
the Next.js dev-tools badge burned into the corner of every screenshot. Once
each server config was moved to a port nothing else in the project ever
binds to, `reuseExistingServer` can only ever reuse a previous run of that
same config's own production server, so local runs stay fast without the
risk of quietly measuring the wrong build. A future change that
"simplifies" this back to one shared port for dev, E2E, Lighthouse, and
resilience would reintroduce both failure modes.

## The content pipeline

`loadSection(name, schema)` in `src/lib/content/loader.ts` runs inside a
Server Component render, not at build time: `app/page.tsx` calls it once per
section via `Promise.all`, and `app/layout.tsx`'s `generateMetadata` calls it
once more for `site.json` (Next memoizes the identical `fetch` within one
render pass, so `site.json` is only actually read once). Because this is a
runtime fetch, the eight files under `public/data/` can change after the
build already exists, without a rebuild.

**`CONTENT_BASE_URL`.** `fetch` running on the server rejects relative URLs,
so a base origin has to be resolved from somewhere. `contentBase()` checks,
in order: the explicit `CONTENT_BASE_URL` environment variable (trailing
slashes stripped), then a `VERCEL_URL`-derived `https://.../data` origin,
then `http://localhost:3000/data` as the last resort. The E2E resilience
specs use this to point the whole app at a local fixture server
(`e2e/fixture-server.mjs`) instead of `public/data/`, which is what lets them
serve deliberately well-formed or deliberately broken JSON without touching
the real content files.

**`revalidate: 60`.** Every fetch passes `next: { revalidate: revalidateSeconds() }`,
which defaults to 60 seconds and can be overridden with the
`CONTENT_REVALIDATE` environment variable (parsed as a non-negative finite
number; any other value falls back to 60). This is what keeps a content edit
visible within a minute while still letting most requests serve from cache,
which is the difference between hitting and missing the Lighthouse
performance budget on a page that makes eight content fetches. The
resilience specs set `CONTENT_REVALIDATE=0` so a fixture change is visible
on the very next request instead of waiting out the window.

**Fallback over failure.** Malformed JSON never reaches the schema at all —
`response.json()` throws and `loadSection`'s catch returns `schema.parse({})`
for the whole section. `safeParse` sees only well-formed JSON, and fails
outright just for a root value that is not an object; a missing or
wrong-shaped field never takes a whole section down.
The mechanism is in `src/lib/content/zod-helpers.ts`, and the order of
`.default()` and `.catch()` in `field()` is the mechanism, not an
implementation detail:

```ts
return schema.default(fallback).catch(() => {
  warnContent(path, 'wrong type, using fallback');
  return fallback;
});
```

`.default()` only substitutes its fallback when the incoming value is
exactly `undefined` — a key that is missing entirely — and it does so
silently, with no warning. `.catch()` fires when the schema underneath it
fails to parse the value it was actually given, which only happens for a
key that is _present_ but the wrong shape or type. Because `.default()` sits
inside `.catch()` here, a missing key is resolved before `.catch()` is ever
reached, so it never warns. Reversing the order — catching before
defaulting — would make a missing key fail the inner parse too (most Zod
schemas reject `undefined`), land in `.catch()`, and start warning about
something that is not an authoring mistake: this project's own rule is that
a missing field is expected and silent, and only a field that is present but
malformed is worth a console warning naming the file and the field.
