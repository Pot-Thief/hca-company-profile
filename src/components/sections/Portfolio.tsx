import { PortfolioRow } from '@/components/interactive/PortfolioRow';
import { SectionShell } from './SectionShell';
import type { Portfolio as PortfolioContent } from '@/lib/content/types';

// Six full-width rows, not cards. A hairline between rows is a structural
// boundary worth drawing; the row's own content stays free of one, same
// reasoning as Purpose and Services.
export function Portfolio({ label, headline, items }: PortfolioContent) {
  return (
    <SectionShell id="portfolio" label={label} headline={headline} surface="ink">
      {items.length > 0 ? (
        <div data-block="items">
          {items.map((item, index) => (
            <div key={index} className={index > 0 ? 'border-t border-rule' : undefined}>
              <PortfolioRow item={item} />
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
