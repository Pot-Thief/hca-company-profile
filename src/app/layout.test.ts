import { afterEach, describe, expect, test, vi } from 'vitest';

// generateMetadata was outside the coverage include list, so its one conditional
// — whether an OG image is emitted at all — was never executed by anything, and
// no E2E spec asserted an og: tag either. A site.json with no ogImage.src is a
// supported state, and the branch that handles it had no proof it worked.
const loadSection = vi.fn();
vi.mock('@/lib/content/loader', () => ({ loadSection: () => loadSection() }));

// next/font runs at module scope and needs the Next build pipeline, so importing
// layout.tsx at all requires standing it down. It returns only the CSS variable
// names the module spreads onto <html>, which generateMetadata never touches.
vi.mock('next/font/google', () => ({
  Archivo: () => ({ variable: '--font-archivo' }),
  IBM_Plex_Mono: () => ({ variable: '--font-plex-mono' }),
}));

afterEach(() => {
  vi.resetModules();
});

const site = (ogImage: { src: string; alt: string }) => ({
  meta: { title: 'TITLE_X', description: 'DESC_X', ogImage },
});

describe('generateMetadata', () => {
  test('carries the title and description from site.json', async () => {
    loadSection.mockResolvedValue(site({ src: '/assets/images/hero-bg.jpg', alt: 'ALT_X' }));
    const { generateMetadata } = await import('./layout');
    const meta = await generateMetadata();
    expect(meta.title).toBe('TITLE_X');
    expect(meta.description).toBe('DESC_X');
    expect(meta.openGraph?.title).toBe('TITLE_X');
  });

  test('emits the og image when one is configured', async () => {
    loadSection.mockResolvedValue(site({ src: '/assets/images/hero-bg.jpg', alt: 'ALT_X' }));
    const { generateMetadata } = await import('./layout');
    const meta = await generateMetadata();
    expect(meta.openGraph?.images).toEqual([{ url: '/assets/images/hero-bg.jpg', alt: 'ALT_X' }]);
  });

  test('emits no og image rather than an empty one when the src is blank', async () => {
    loadSection.mockResolvedValue(site({ src: '', alt: '' }));
    const { generateMetadata } = await import('./layout');
    const meta = await generateMetadata();
    expect(meta.openGraph?.images).toEqual([]);
  });
});

// RootLayout returns <html>, which RTL cannot mount into a container, so it is
// called directly and its returned element inspected. Both assertions are load
// bearing: `lang` is what a screen reader picks a pronunciation from, and the
// two font variables are what every `var(--font-…)` in the stylesheet resolves
// against — drop one and the whole page silently falls back to a system font.
describe('RootLayout', () => {
  test('sets the document language and both font variables on the root element', async () => {
    const { default: RootLayout } = await import('./layout');
    const element = RootLayout({ children: null }) as {
      props: { lang: string; className: string };
    };
    expect(element.props.lang).toBe('en');
    expect(element.props.className).toContain('--font-archivo');
    expect(element.props.className).toContain('--font-plex-mono');
  });
});
