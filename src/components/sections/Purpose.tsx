import { SectionShell } from './SectionShell';
import type { Purpose as PurposeContent } from '@/lib/content/types';

function hairlines(index: number) {
  const isFirstRow = index < 2;
  const isFirstColumn = index % 2 === 0;
  const classes = ['border-rule'];
  if (index > 0) classes.push('border-t');
  if (isFirstRow && index > 0) classes.push('md:border-t-0');
  if (!isFirstRow) classes.push('md:border-t');
  if (!isFirstColumn) classes.push('md:border-l');
  return classes.join(' ');
}

export function Purpose({ label, headline, items }: PurposeContent) {
  return (
    <SectionShell id="purpose" label={label} headline={headline} surface="ink">
      {items.length > 0 ? (
        <div
          data-block="items"
          className="grid grid-cols-1 md:-mx-[var(--space-gutter)] md:grid-cols-2"
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`py-[var(--space-block)] md:px-[var(--space-gutter)] ${hairlines(index)}`}
            >
              <h3 className="font-body font-semibold text-h3 leading-heading text-on-surface">
                {item.title}
              </h3>
              <p className="mt-3 max-w-measure text-body text-on-surface-muted">{item.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-on-surface-muted">
          No purpose statements yet. Add items to purpose.json.
        </p>
      )}
    </SectionShell>
  );
}
