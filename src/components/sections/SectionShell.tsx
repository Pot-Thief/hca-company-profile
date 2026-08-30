import type { ReactNode } from 'react';

export function SectionShell({
  id,
  label,
  headline,
  surface = 'paper',
  children,
}: {
  id: string;
  label: string;
  headline: string;
  surface?: 'paper' | 'ink';
  children: ReactNode;
}) {
  const text = headline || label || id;
  // The top hairline exists because colour stopped separating sections. An ink
  // section still changes colour, so the line there is redundant — and at
  // anchor-scroll it would stack its graphite rule under the navbar's ash one,
  // two greys deep.
  const edge = surface === 'ink' ? '' : ' border-t border-rule';
  return (
    <section
      id={id}
      data-surface={surface === 'ink' ? 'ink' : undefined}
      className={`bg-surface text-on-surface${edge}`}
    >
      <div className="mx-auto max-w-page px-[var(--space-gutter)] py-[var(--space-section)] md:grid md:grid-cols-[8rem_1fr] md:gap-[var(--space-gutter)]">
        <div className="mb-[var(--space-block)] md:mb-0">
          {label ? (
            <p className="font-mono text-label uppercase tracking-label text-on-surface-muted md:sticky md:top-[calc(var(--nav-h)+var(--space-block))]">
              {label}
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="type-display text-h2 leading-heading text-balance">{text}</h2>
          <div className="mt-[var(--space-block)]">{children}</div>
        </div>
      </div>
    </section>
  );
}
