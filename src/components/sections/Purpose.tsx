import { SectionHeading } from './SectionHeading';
import type { Purpose as PurposeContent } from '@/lib/content/types';

function hairlines(index: number) {
  const isFirstRow = index < 2;
  const isFirstColumn = index % 2 === 0;
  const classes = ['border-ash'];
  if (index > 0) classes.push('border-t');
  if (isFirstRow && index > 0) classes.push('md:border-t-0');
  if (!isFirstRow) classes.push('md:border-t');
  if (!isFirstColumn) classes.push('md:border-l');
  return classes.join(' ');
}

export function Purpose({ label, headline, items }: PurposeContent) {
  return (
    <section
      id="purpose"
      className="mx-auto max-w-page px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <SectionHeading id="purpose" label={label} headline={headline} />

      {items.length > 0 ? (
        <div data-block="items" className="grid grid-cols-1 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`py-[var(--space-block)] md:px-[var(--space-gutter)] ${hairlines(index)}`}
            >
              <h3 className="font-display text-h3 leading-heading text-ink">{item.title}</h3>
              <p className="mt-3 max-w-measure text-body text-graphite">{item.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-graphite">
          No purpose statements yet. Add items to purpose.json.
        </p>
      )}
    </section>
  );
}
