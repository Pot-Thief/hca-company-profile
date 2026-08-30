import { SectionShell } from './SectionShell';
import type { Services as ServicesContent } from '@/lib/content/types';

// Twelve items are separated by space, not by rules. A hairline should mark a
// structural boundary; drawn at every adjacency it stops meaning anything, and
// twelve of them in one section were most of the lines on the whole page.
//
// No icons either. Each item used to carry one from a registry, and Gate B
// removed it to see what that cost: the grid tightened, the names rose to the
// top of their cells, and nothing was lost, because there was no information in
// them to lose. Twelve generic technology glyphs used as filler is a pattern the
// design research names outright.
export function Services({ label, headline, items }: ServicesContent) {
  return (
    <SectionShell id="services" label={label} headline={headline}>
      {items.length > 0 ? (
        <div
          data-block="items"
          className="grid grid-cols-1 gap-x-[var(--space-gutter)] gap-y-[var(--space-section)] md:grid-cols-2 xl:grid-cols-3"
        >
          {items.map((item, index) => (
            <div key={index}>
              <h3 className="font-body font-semibold text-h3 leading-heading text-on-surface">
                {item.name}
              </h3>
              <p className="mt-3 max-w-measure text-body text-on-surface-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-on-surface-muted">
          No services yet. Add items to services.json.
        </p>
      )}
    </SectionShell>
  );
}
