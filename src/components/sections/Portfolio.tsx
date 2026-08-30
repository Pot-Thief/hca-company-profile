import { PortfolioRow } from '@/components/interactive/PortfolioRow';
import { SectionShell } from './SectionShell';
import type { Portfolio as PortfolioContent, UiLabels } from '@/lib/content/types';

// Six full-width rows, not cards. A hairline between rows is a structural
// boundary worth drawing; the row's own content stays free of one, same
// reasoning as Purpose and Services.
//
// The rows are pulled a block wider than the text column and their content
// padded back to it. The hover tint had been starting exactly on the logo's left
// edge, so a whole-row target looked like a box drawn tight around its contents.
// Widening the row rather than indenting the content keeps every row aligned
// with the heading above, and the dividing rules move with the tint so the two
// still end at the same place.
export function Portfolio({ label, headline, items, ui }: PortfolioContent & { ui: UiLabels }) {
  return (
    <SectionShell id="portfolio" label={label} headline={headline}>
      {items.length > 0 ? (
        <div data-block="items" className="-mx-[var(--space-block)]">
          {items.map((item, index) => (
            <div key={index} className={index > 0 ? 'border-t border-rule' : undefined}>
              <PortfolioRow item={item} ui={ui} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-on-surface-muted">
          No projects yet. Add items to portfolio.json.
        </p>
      )}
    </SectionShell>
  );
}
