'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Team, UiLabels } from '@/lib/content/types';

export function TeamMember({ member, ui }: { member: Team['members'][number]; ui: UiLabels }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="relative aspect-square w-full">
        <Image
          src={member.photo.src}
          alt={member.photo.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <h3 className="mt-[var(--space-block)] font-body font-semibold text-h3 leading-heading text-on-surface">
        {member.name}
      </h3>
      <p className="text-body text-on-surface-muted">{member.role}</p>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className="mt-3 font-mono text-label uppercase tracking-label text-on-surface-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface"
          aria-label={`${open ? ui.collapseBio : ui.expandBio} ${member.name}`}
        >
          {open ? ui.collapseBio : ui.expandBio}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mt-3 max-w-measure text-body text-on-surface-muted">{member.bio}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
