'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Portfolio, UiLabels } from '@/lib/content/types';

// A row's own content (logo, title, category) is identical whether or not it
// opens. Only the wrapper differs: a trigger button when there is a
// description to reveal, a plain div when there is not.
//
// `action` is the one thing that does differ, and it is why it exists: with the
// whole row as the target there was nothing on it that said so. aria-expanded
// tells a screen reader and the hover tint tells whoever is already pointing at
// it, but a sighted reader scanning the page saw six rows and no controls. The
// label names the action and doubles as state by flipping when open. It is not
// an icon, because a chevron would be one more thing to explain and this reads
// in the same mono register as every other label on the page.
function RowContent({ item, action }: { item: Portfolio['items'][number]; action?: string }) {
  return (
    <div className="grid grid-cols-2 items-center gap-y-3 px-[var(--space-block)] py-[var(--space-block)] md:flex md:flex-row md:items-center md:gap-x-[var(--space-gutter)]">
      {/* Logo: Col 1 on mobile */}
      <div className="relative h-[calc(200px/3)] w-[160px] sm:w-[200px] shrink-0">
        <Image
          src={item.logo.src}
          alt={item.logo.alt}
          fill
          sizes="200px"
          className="object-contain object-left"
        />
      </div>

      {/* Action: Col 2 (right-aligned) on mobile; on desktop pushed to far right */}
      {action ? (
        <span className="col-start-2 justify-self-end font-mono text-label uppercase tracking-label text-on-surface-muted md:order-last md:ml-auto md:justify-self-auto">
          {action}
        </span>
      ) : null}

      {/* Title & Category: Full row 2 on mobile; middle item on desktop */}
      <div className="col-span-2 flex flex-col gap-y-1 md:col-span-1 md:flex-row md:items-center md:gap-x-[var(--space-gutter)]">
        <h3 className="font-body font-semibold text-h3 leading-heading text-on-surface">
          {item.title}
        </h3>
        <p className="font-mono text-label uppercase tracking-label text-on-surface-muted">
          {item.category}
        </p>
      </div>
    </div>
  );
}

export function PortfolioRow({ item, ui }: { item: Portfolio['items'][number]; ui: UiLabels }) {
  const [open, setOpen] = useState(false);

  if (!item.description) {
    return <RowContent item={item} />;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className="block w-full text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-on-surface/10"
        aria-label={item.title}
      >
        <RowContent item={item} action={open ? ui.collapseProject : ui.expandProject} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="max-w-measure px-[var(--space-block)] pb-[var(--space-block)] text-body text-on-surface-muted">
          {item.description}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
