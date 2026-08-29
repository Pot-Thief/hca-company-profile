'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Portfolio } from '@/lib/content/types';

// A row's own content (logo, title, category) is identical whether or not it
// opens. Only the wrapper differs: a trigger button when there is a
// description to reveal, a plain div when there is not.
function RowContent({ item }: { item: Portfolio['items'][number] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-[var(--space-gutter)] gap-y-3 py-[var(--space-block)]">
      <div className="relative h-[calc(200px/3)] w-[200px] shrink-0">
        <Image
          src={item.logo.src}
          alt={item.logo.alt}
          fill
          sizes="200px"
          className="object-contain"
        />
      </div>
      <h3 className="font-body font-semibold text-h3 leading-heading text-on-surface">
        {item.title}
      </h3>
      <p className="font-mono text-label uppercase tracking-label text-on-surface-muted">
        {item.category}
      </p>
    </div>
  );
}

export function PortfolioRow({ item }: { item: Portfolio['items'][number] }) {
  const [open, setOpen] = useState(false);

  if (!item.description) {
    return <RowContent item={item} />;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className="w-full text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-on-surface/10"
        aria-label={item.title}
      >
        <RowContent item={item} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="max-w-measure pb-[var(--space-block)] text-body text-on-surface-muted">
          {item.description}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
