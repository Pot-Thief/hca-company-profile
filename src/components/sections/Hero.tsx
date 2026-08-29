import Image from 'next/image';
import type { Hero as HeroContent } from '@/lib/content/types';

const actionClass = {
  primary: 'bg-paper text-ink hover:bg-mist',
  ghost: 'border border-paper text-paper hover:bg-paper/10',
};

export function Hero({ eyebrow, headline, subheadline, backgroundImage, actions }: HeroContent) {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="rounded-none object-cover"
      />
      <div className="absolute inset-0 bg-ink/60" />

      <div className="relative mx-auto w-full max-w-6xl px-[var(--space-gutter)] pb-[var(--space-section)] pt-[calc(var(--nav-h)+var(--space-section))]">
        <div className="max-w-[var(--container-measure)]">
          {eyebrow ? (
            <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-label text-mist">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-[var(--space-block)] font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-[1.02] text-paper text-balance">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-[var(--space-block)] text-[length:var(--text-body)] text-mist">
              {subheadline}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div className="mt-[var(--space-block)] flex flex-wrap items-center gap-[var(--space-gutter)]">
              {actions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={`rounded-edge px-6 py-3 font-[family-name:var(--font-body)] text-[length:var(--text-small)] transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] ${actionClass[action.variant]}`}
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
