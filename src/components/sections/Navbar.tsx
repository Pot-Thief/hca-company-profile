import { MobileNav } from '@/components/interactive/MobileNav';
import type { Site, UiLabels } from '@/lib/content/types';

export function Navbar({
  logo,
  nav,
  cta,
  ui,
}: {
  logo: Site['logo'];
  nav: Site['nav'];
  cta: Site['cta'];
  ui: UiLabels;
}) {
  return (
    <header
      data-nav
      className="fixed inset-x-0 top-0 z-30 h-[var(--nav-h)] border-b border-ash bg-paper"
    >
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-[var(--space-gutter)] px-[var(--space-gutter)]">
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-h3)] text-ink">
          {logo.wordmark}
        </span>

        <ul className="hidden items-center gap-[var(--space-gutter)] md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-[family-name:var(--font-body)] text-[length:var(--text-small)] text-ink underline decoration-ash underline-offset-4 transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-graphite hover:decoration-graphite"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={cta.href}
          className="hidden rounded-edge border border-ink px-4 py-2 font-[family-name:var(--font-body)] text-[length:var(--text-small)] text-ink transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-ink hover:text-paper md:inline-block"
        >
          {cta.label}
        </a>

        <MobileNav nav={nav} cta={cta} ui={ui} />
      </div>
    </header>
  );
}
