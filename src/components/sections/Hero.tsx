import Image from 'next/image';
import type { Hero as HeroContent } from '@/lib/content/types';

const actionClass = {
  primary: 'bg-on-surface text-surface hover:bg-on-surface/90',
  ghost: 'border border-on-surface text-on-surface hover:bg-on-surface/10',
};

export function Hero({ eyebrow, headline, subheadline, backgroundImage, actions }: HeroContent) {
  return (
    // svh rather than vh: on mobile browsers vh includes the collapsing
    // toolbar, which crops the content. The cap keeps a tall monitor from
    // stretching the hero past what the copy needs.
    <section
      data-surface="ink"
      className="relative flex min-h-[min(88svh,38rem)] items-end overflow-hidden"
    >
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="rounded-none object-cover"
      />
      {/* The one place a token is bypassed: this darkens the photograph
          underneath it, not a section surface, so it stays tied to ink. */}
      <div className="absolute inset-0 bg-ink/60" />

      <div className="relative mx-auto w-full max-w-page px-[var(--space-gutter)] pb-[var(--space-section)] pt-[calc(var(--nav-h)+var(--space-section))]">
        {/* The headline spans the page container. `max-w-measure` is 62ch at
            body size, a reading measure, and constraining display type to it
            stacks a 53-character headline into six lines. Only the prose below
            takes the measure. */}
        <div>
          {eyebrow ? (
            <p className="font-mono text-label uppercase tracking-label text-on-surface-muted">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-[var(--space-block)] max-w-[24ch] type-display text-display leading-display text-on-surface text-balance">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-[var(--space-block)] max-w-measure text-body text-on-surface-muted">
              {subheadline}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div
              data-block="actions"
              className="mt-[var(--space-block)] flex flex-wrap items-center gap-[var(--space-gutter)]"
            >
              {actions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={`rounded-edge px-6 py-3 font-body text-small transition-[background-color,color] duration-[var(--duration-fast)] ease-out ${actionClass[action.variant]}`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
