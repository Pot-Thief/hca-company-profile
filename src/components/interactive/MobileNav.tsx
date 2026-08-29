'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Site, UiLabels } from '@/lib/content/types';

// Controlled rather than uncontrolled, for one reason: every link in here jumps
// to a section of this same page. A hash change is not a navigation the sheet
// can notice, so an uncontrolled sheet stayed open on top of the very section
// the reader had just asked to see.
export function MobileNav({ nav, cta, ui }: { nav: Site['nav']; cta: Site['cta']; ui: UiLabels }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="md:hidden">{ui.menu}</Button>
      </SheetTrigger>
      <SheetContent aria-label={ui.menu} closeLabel={ui.closeMenu}>
        <nav className="mt-[var(--space-block)] flex flex-col gap-[var(--space-block)]">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="font-[family-name:var(--font-body)] text-[length:var(--text-h3)] text-on-surface"
            >
              {item.label}
            </a>
          ))}
          <a
            href={cta.href}
            onClick={close}
            className="inline-block w-fit rounded-edge border border-signal px-4 py-2 font-[family-name:var(--font-body)] text-[length:var(--text-body)] text-signal transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-signal hover:text-surface"
          >
            {cta.label}
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
