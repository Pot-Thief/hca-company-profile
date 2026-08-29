'use client';

import { useEffect, useState } from 'react';
import type { Site } from '@/lib/content/types';

const LINK_CLASS =
  'font-[family-name:var(--font-body)] text-[length:var(--text-small)] text-on-surface underline underline-offset-4 transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface-muted hover:decoration-on-surface-muted';

export function NavLinks({ nav }: { nav: Site['nav'] }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = nav
      .map((item) => document.getElementById(item.href.replace('#', '')))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [nav]);

  return (
    <ul className="hidden items-center gap-[var(--space-gutter)] md:flex">
      {nav.map((item) => {
        const isCurrent = active === item.href.replace('#', '');
        return (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={isCurrent ? 'location' : undefined}
              className={`${LINK_CLASS} ${isCurrent ? 'decoration-on-surface' : 'decoration-rule'}`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
