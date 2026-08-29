import { notFound } from 'next/navigation';

const COLORS = [
  { name: 'paper', value: 'var(--color-paper)', hex: '#fafafa', hairline: true },
  { name: 'mist', value: 'var(--color-mist)', hex: '#ededed', hairline: true },
  { name: 'ash', value: 'var(--color-ash)', hex: '#c8c8c8', hairline: false },
  { name: 'graphite', value: 'var(--color-graphite)', hex: '#585858', hairline: false },
  { name: 'ink', value: 'var(--color-ink)', hex: '#1a1a1a', hairline: false },
  { name: 'void', value: 'var(--color-void)', hex: '#000000', hairline: false },
] as const;

const LABEL_CLASS = 'font-mono text-label uppercase tracking-label';

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className={`${LABEL_CLASS} text-graphite`}>
      {children}
    </h2>
  );
}

function TypeSample({
  token,
  family,
  sampleClassName,
  text,
}: {
  token: string;
  family: string;
  sampleClassName: string;
  text: string;
}) {
  return (
    <div>
      <p className={sampleClassName}>{text}</p>
      <p className={`mt-2 ${LABEL_CLASS} text-graphite`}>
        {token} &mdash; font-{family}
      </p>
    </div>
  );
}

function StateExample({ state, anchorClassName }: { state: string; anchorClassName: string }) {
  return (
    <div>
      <a href="#top" className={anchorClassName}>
        Primary action
      </a>
      <p className={`mt-2 ${LABEL_CLASS} text-graphite`}>{state}</p>
    </div>
  );
}

function GhostStateExample({ state, anchorClassName }: { state: string; anchorClassName: string }) {
  return (
    <div>
      <a href="#top" className={anchorClassName}>
        Ghost action
      </a>
      <p className={`mt-2 ${LABEL_CLASS} text-graphite`}>{state}</p>
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto max-w-4xl px-[var(--space-gutter)] py-16">
      <header>
        <h1 id="top" className="type-display text-h2 leading-heading">
          Styleguide
        </h1>
        <p className="mt-4 max-w-measure font-body text-body text-graphite">
          Design tokens for the company profile, rendered plainly for review before any section is
          built. Development only.
        </p>
      </header>

      <section aria-labelledby="palette" className="border-t border-ash py-16">
        <SectionHeading id="palette">Palette</SectionHeading>
        <ul className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
          {COLORS.map(({ name, value, hex, hairline }) => (
            <li key={name}>
              <span
                aria-hidden
                className={`block h-20 w-full ${hairline ? 'border border-ash' : ''}`}
                style={{ background: value }}
              />
              <span className="mt-3 block font-mono text-small">{name}</span>
              <span className={`block ${LABEL_CLASS} text-graphite`}>{hex}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type-scale" className="border-t border-ash py-16">
        <SectionHeading id="type-scale">Type scale</SectionHeading>
        <div className="mt-8 flex flex-col gap-8">
          <TypeSample
            token="display"
            family="display"
            sampleClassName="type-display text-display leading-display"
            text="Lorem ipsum dolor sit amet"
          />
          <TypeSample
            token="h2"
            family="display"
            sampleClassName="type-display text-h2 leading-heading"
            text="Lorem ipsum dolor sit amet"
          />
          <TypeSample
            token="h3"
            family="body semibold"
            sampleClassName="font-body font-semibold text-h3 leading-heading"
            text="Lorem ipsum dolor sit amet"
          />
          <TypeSample
            token="body"
            family="body"
            sampleClassName="font-body text-body"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          />
          <TypeSample
            token="small"
            family="body"
            sampleClassName="font-body text-small"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          />
          <TypeSample
            token="label"
            family="mono"
            sampleClassName="font-mono text-label uppercase tracking-label"
            text="Lorem ipsum dolor sit amet"
          />
        </div>
      </section>

      <section aria-labelledby="pairing" className="border-t border-ash py-16">
        <SectionHeading id="pairing">Typeface pairing</SectionHeading>
        <div className="mt-8 flex flex-col gap-6">
          <p className="type-display text-h2 leading-heading">
            Lorem ipsum dolor sit amet consectetur
          </p>
          <p className="font-body text-h3">Lorem ipsum dolor sit amet consectetur</p>
          <p className="font-mono text-h3">Lorem ipsum dolor sit amet consectetur</p>
        </div>
        <p className={`mt-6 ${LABEL_CLASS} text-graphite`}>
          display setting &middot; body setting &middot; mono
        </p>
        <p className="mt-2 font-body text-small text-graphite">
          Display and body are the same variable family, Archivo, at different weight and width.
          Only mono is a second face. Stacked rather than set on one line because the sizes differ
          too much to share a line and still read at a size that suits each.
        </p>
      </section>

      <section aria-labelledby="motion" className="border-t border-ash py-16">
        <SectionHeading id="motion">Motion</SectionHeading>
        <div className="mt-8 flex flex-wrap gap-12">
          <div>
            <div
              aria-hidden
              className="h-16 w-16 bg-ink transition-[transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-1 hover:opacity-70"
            />
            <p className={`mt-3 ${LABEL_CLASS} text-graphite`}>duration-fast, ease-out</p>
          </div>
          <div>
            <div
              aria-hidden
              className="h-16 w-16 bg-ink transition-[transform,opacity] duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:opacity-70"
            />
            <p className={`mt-3 ${LABEL_CLASS} text-graphite`}>duration-base, ease-out</p>
          </div>
          <div>
            <div
              aria-hidden
              className="h-16 w-16 bg-ink transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out)] hover:-translate-y-1 hover:opacity-70"
            />
            <p className={`mt-3 ${LABEL_CLASS} text-graphite`}>duration-slow, ease-out</p>
          </div>
        </div>
        <p className="mt-8 font-body text-small text-graphite">
          Hover a square to preview. All three are disabled under prefers-reduced-motion. The
          millisecond values are deliberately not printed here: hardcoded copy desynchronises the
          moment a token changes, and it already did once. Read them from globals.css.
        </p>
      </section>

      <section aria-labelledby="interactive-states" className="border-t border-ash py-16">
        <SectionHeading id="interactive-states">Interactive states</SectionHeading>

        <p className={`mt-8 ${LABEL_CLASS}`}>Primary</p>
        <div className="mt-4 flex flex-wrap gap-8">
          <StateExample
            state="rest"
            anchorClassName="inline-block rounded-edge border border-ink px-6 py-3 font-body text-body text-ink transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-ink hover:text-paper"
          />
          <StateExample
            state="hover (forced for preview)"
            anchorClassName="inline-block rounded-edge border border-ink bg-ink px-6 py-3 font-body text-body text-paper"
          />
          <StateExample
            state="focus (forced for preview)"
            anchorClassName="inline-block rounded-edge border border-ink px-6 py-3 font-body text-body text-ink outline-2 outline-offset-2 outline-[var(--color-void)]"
          />
        </div>

        <p className={`mt-12 ${LABEL_CLASS}`}>Ghost</p>
        <div className="mt-4 flex flex-wrap gap-8">
          <GhostStateExample
            state="rest"
            anchorClassName="inline-block px-6 py-3 font-body text-body text-ink underline decoration-ash underline-offset-4 transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-graphite hover:decoration-graphite"
          />
          <GhostStateExample
            state="hover (forced for preview)"
            anchorClassName="inline-block px-6 py-3 font-body text-body text-graphite underline decoration-graphite underline-offset-4"
          />
          <GhostStateExample
            state="focus (forced for preview)"
            anchorClassName="inline-block px-6 py-3 font-body text-body text-ink underline decoration-ash underline-offset-4 outline-2 outline-offset-2 outline-[var(--color-void)]"
          />
        </div>

        <p className="mt-8 font-body text-small text-graphite">
          Tab to either rest example to see the real focus outline; move the mouse over it to see
          the real hover change. The primary action uses radius-edge, 3px, the only radius in the
          system besides zero. Structural edges such as section blocks and images stay square.
        </p>
      </section>

      <section aria-labelledby="hairlines-spacing" className="border-t border-ash py-16">
        <SectionHeading id="hairlines-spacing">Hairlines and spacing</SectionHeading>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="bg-paper p-8">
            <div className="border-t border-ash" />
            <p className={`mt-3 ${LABEL_CLASS} text-graphite`}>hairline on paper</p>
          </div>
          <div className="bg-ink p-8">
            <div className="border-t border-ash" />
            <p className={`mt-3 ${LABEL_CLASS} text-paper`}>hairline on ink</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6">
          <div>
            <div className="h-3 bg-graphite" style={{ width: 'var(--space-gutter)' }} />
            <p className={`mt-2 ${LABEL_CLASS} text-graphite`}>
              space-gutter &mdash; clamp(1.25rem, 4vw, 4rem)
            </p>
          </div>
          <div>
            <div className="h-3 bg-graphite" style={{ width: 'var(--space-section)' }} />
            <p className={`mt-2 ${LABEL_CLASS} text-graphite`}>
              space-section &mdash; clamp(5rem, 10vw, 9rem)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
