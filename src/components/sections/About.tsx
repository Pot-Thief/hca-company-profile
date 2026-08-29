import { SectionHeading } from './SectionHeading';
import type { About as AboutContent } from '@/lib/content/types';

export function About({ label, headline, paragraphs, stats }: AboutContent) {
  return (
    <section
      id="about"
      className="mx-auto max-w-page px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <SectionHeading id="about" label={label} headline={headline} />

      {paragraphs.length > 0 ? (
        <div data-block="paragraphs" className="max-w-measure space-y-[var(--space-block)]">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-body text-graphite">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {stats.length > 0 ? (
        <div
          data-block="stats"
          className="mt-[var(--space-block)] grid grid-cols-1 divide-y divide-ash md:-mx-[var(--space-gutter)] md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {stats.map((stat, index) => (
            <div key={index} className="py-[var(--space-block)] md:px-[var(--space-gutter)]">
              <p className="font-display text-h2 leading-heading text-ink">{stat.value}</p>
              <p className="mt-3 font-mono text-label uppercase tracking-label text-graphite">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
