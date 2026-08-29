import { getIcon } from '@/lib/icons';
import { SectionShell } from './SectionShell';
import type { Services as ServicesContent } from '@/lib/content/types';

// Column count changes per breakpoint (1 / 2 / 3), so "first row" isn't a
// fixed modulo. A left/right divider would need to know which breakpoint is
// active, which a Tailwind class list can't express. Top-only hairlines sidestep
// that: "index < columns-at-this-breakpoint" identifies the first row correctly
// at every breakpoint and for any item count, not just twelve.
function hairlines(index: number) {
  const classes = ['border-rule'];
  if (index > 0) classes.push('border-t');
  if (index > 0 && index < 2) classes.push('md:border-t-0');
  if (index > 0 && index < 3) classes.push('xl:border-t-0');
  return classes.join(' ');
}

export function Services({ label, headline, items }: ServicesContent) {
  return (
    <SectionShell id="services" label={label} headline={headline}>
      {items.length > 0 ? (
        <div
          data-block="items"
          className="grid grid-cols-1 md:-mx-[var(--space-gutter)] md:grid-cols-2 xl:grid-cols-3"
        >
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={index}
                className={`py-[var(--space-block)] md:px-[var(--space-gutter)] ${hairlines(index)}`}
              >
                <Icon aria-hidden="true" size={20} className="text-on-surface-muted" />
                <h3 className="mt-3 font-body font-semibold text-h3 leading-heading text-on-surface">
                  {item.name}
                </h3>
                <p className="mt-3 max-w-measure text-body text-on-surface-muted">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-body text-on-surface-muted">
          No services yet. Add items to services.json.
        </p>
      )}
    </SectionShell>
  );
}
