import { getIcon } from '@/lib/icons';
import { SectionShell } from './SectionShell';
import type { Services as ServicesContent } from '@/lib/content/types';

// Twelve items are separated by space, not by rules. A hairline should mark a
// structural boundary; drawn at every adjacency it stops meaning anything, and
// twelve of them in one section were most of the lines on the whole page.
export function Services({ label, headline, items }: ServicesContent) {
  return (
    <SectionShell id="services" label={label} headline={headline}>
      {items.length > 0 ? (
        <div
          data-block="items"
          className="grid grid-cols-1 gap-x-[var(--space-gutter)] gap-y-[var(--space-section)] md:grid-cols-2 xl:grid-cols-3"
        >
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={index}>
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
