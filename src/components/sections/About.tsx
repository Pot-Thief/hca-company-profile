import { SectionShell } from './SectionShell';
import type { About as AboutContent } from '@/lib/content/types';

export function About({ label, headline, paragraphs, stats }: AboutContent) {
  return (
    <SectionShell id="about" label={label} headline={headline}>
      {paragraphs.length > 0 ? (
        <div data-block="paragraphs" className="max-w-measure space-y-[var(--space-block)]">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-body text-on-surface-muted">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {stats.length > 0 ? (
        <div
          data-block="stats"
          className="mt-[var(--space-block)] grid grid-cols-1 divide-y divide-rule md:-mx-[var(--space-gutter)] md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {stats.map((stat, index) => (
            <div key={index} className="py-[var(--space-block)] md:px-[var(--space-gutter)]">
              <p className="type-display text-h2 leading-heading text-on-surface">{stat.value}</p>
              <p className="mt-3 font-mono text-label uppercase tracking-label text-on-surface-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}
