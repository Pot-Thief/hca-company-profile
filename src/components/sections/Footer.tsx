import { channelHref } from '@/lib/content/channel-href';
import { GridLines } from './GridLines';
import type { ContactChannel, Site } from '@/lib/content/types';

// Contact lands on ink and the footer continues it rather than breaking back
// to paper: together they are the page's closing emphasis, echoing Hero's
// opening one. The border-t on the footer itself is the boundary Contact
// needed, so the two ink blocks read as section-then-close, not one
// undivided mass.
export function Footer({
  logo,
  nav,
  copyright,
  social,
}: {
  logo: Site['logo'];
  nav: Site['footer']['nav'];
  copyright: string;
  social: ContactChannel[];
}) {
  return (
    <footer data-surface="ink" className="relative border-t border-rule bg-surface text-on-surface">
      {/* No rail here — the footer is a single justified row — so the grid draws
          the two container edges only, carrying the page's column structure
          through the closing block instead of stopping halfway down the ink. */}
      <GridLines />
      <div className="relative mx-auto max-w-page px-[var(--space-gutter)] py-[var(--space-section)]">
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-block)]">
          <span className="type-display text-h3">{logo.wordmark}</span>

          <div className="flex flex-col items-end gap-[var(--space-block)]">
            <ul className="flex flex-wrap justify-end gap-[var(--space-block)]">
              {nav.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="font-mono text-label uppercase tracking-label text-on-surface-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {social.length > 0 ? (
              <ul
                data-block="social"
                className="flex flex-wrap justify-end gap-[var(--space-block)]"
              >
                {social.map((channel, index) => (
                  <li key={index}>
                    <a
                      href={channelHref(channel.type, channel.value, channel.href)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-label uppercase tracking-label text-on-surface-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface"
                    >
                      {channel.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <p className="mt-[var(--space-block)] border-t border-rule pt-[var(--space-block)] font-mono text-label uppercase tracking-label text-on-surface-muted">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
