import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { loadSection } from '@/lib/content/loader';
import { sectionSchemas } from '@/lib/content/schema';
import './globals.css';

// One variable family carries both display and body. Loaded without a weight
// list so the whole 100-900 range comes through, plus the width axis, which is
// what separates the display setting from the body setting. Two settings of one
// family read as a designed system; two families read as a curated magazine.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

// The same fetch runs here and in Page, and Next memoizes identical GET requests
// within one render pass, so site.json is read once.
export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSection('site', sectionSchemas.site);
  return {
    title: site.meta.title,
    description: site.meta.description,
    openGraph: {
      title: site.meta.title,
      description: site.meta.description,
      images: site.meta.ogImage.src
        ? [{ url: site.meta.ogImage.src, alt: site.meta.ogImage.alt }]
        : [],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <head>
        {/* Arms the scroll reveal, and disarms it if the page never hydrates.
            The CSS that hides un-revealed sections keys off data-reveal-armed
            rather than @media (scripting: enabled), because that media query
            only says the browser permits scripts — not that ours arrived. When
            it did not, six of the page's eight blocks stayed at opacity 0 with
            nothing left to reveal them, and a reader saw a headline and a
            copyright line.

            Inline and synchronous so nothing flashes before it applies. Reveal
            sets data-hydrated on mount, so the timer only ever fires when
            hydration genuinely failed.

            1500ms is deliberately short. If a slow connection trips it before
            the bundle lands, the cost is that the sections appear without their
            fade — content wins over motion. If it were generous enough to never
            misfire, a genuine failure would hold the page blank for that long
            instead. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.dataset.revealArmed='';" +
              "setTimeout(function(){if(d.dataset.hydrated!=='true')" +
              "d.removeAttribute('data-reveal-armed')},1500)})()",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
