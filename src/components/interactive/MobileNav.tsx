'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Site, UiLabels } from '@/lib/content/types';

export function MobileNav({ nav, cta, ui }: { nav: Site['nav']; cta: Site['cta']; ui: UiLabels }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden">{ui.menu}</Button>
      </SheetTrigger>
      <SheetContent aria-label={ui.menu} closeLabel={ui.closeMenu}>
        <nav className="mt-[var(--space-block)] flex flex-col gap-[var(--space-block)]">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-[family-name:var(--font-body)] text-[length:var(--text-h3)] text-on-surface"
            >
              {item.label}
            </a>
          ))}
          <a
            href={cta.href}
            className="inline-block w-fit rounded-edge border border-signal px-4 py-2 font-[family-name:var(--font-body)] text-[length:var(--text-body)] text-signal transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-signal hover:text-surface"
          >
            {cta.label}
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
