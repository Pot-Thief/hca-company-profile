import { z } from 'zod';
import { arrayOf, field } from './zod-helpers';

const str = (path: string, fallback = '') => field(z.string(), fallback, path);

const image = (path: string) =>
  field(z.object({ src: str(`${path}.src`), alt: str(`${path}.alt`) }), { src: '', alt: '' }, path);

export const siteSchema = z.object({
  meta: field(
    z.object({
      title: str('site.meta.title'),
      description: str('site.meta.description'),
      ogImage: image('site.meta.ogImage'),
    }),
    { title: '', description: '', ogImage: { src: '', alt: '' } },
    'site.meta',
  ),
  logo: field(z.object({ wordmark: str('site.logo.wordmark') }), { wordmark: '' }, 'site.logo'),
  nav: arrayOf(z.object({ label: z.string(), href: z.string() }), 'site.nav'),
  cta: field(
    z.object({ label: str('site.cta.label'), href: str('site.cta.href') }),
    { label: '', href: '' },
    'site.cta',
  ),
  footer: field(
    z.object({
      nav: arrayOf(z.object({ label: z.string(), href: z.string() }), 'site.footer.nav'),
      copyright: str('site.footer.copyright'),
    }),
    { nav: [], copyright: '' },
    'site.footer',
  ),
  ui: field(
    z.object({
      menu: str('site.ui.menu', 'Menu'),
      closeMenu: str('site.ui.closeMenu', 'Close menu'),
      copy: str('site.ui.copy', 'Copy'),
      copied: str('site.ui.copied', 'Copied'),
      expandBio: str('site.ui.expandBio', 'Read bio'),
      collapseBio: str('site.ui.collapseBio', 'Hide bio'),
      expandProject: str('site.ui.expandProject', 'Read detail'),
      collapseProject: str('site.ui.collapseProject', 'Hide detail'),
    }),
    {
      menu: 'Menu',
      closeMenu: 'Close menu',
      copy: 'Copy',
      copied: 'Copied',
      expandBio: 'Read bio',
      collapseBio: 'Hide bio',
      expandProject: 'Read detail',
      collapseProject: 'Hide detail',
    },
    'site.ui',
  ),
});

export const heroSchema = z.object({
  eyebrow: str('hero.eyebrow'),
  headline: str('hero.headline'),
  subheadline: str('hero.subheadline'),
  backgroundImage: image('hero.backgroundImage'),
  actions: arrayOf(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'ghost']).default('primary'),
    }),
    'hero.actions',
  ),
});

export const aboutSchema = z.object({
  label: str('about.label'),
  headline: str('about.headline'),
  paragraphs: arrayOf(z.string(), 'about.paragraphs'),
  stats: arrayOf(z.object({ value: z.string(), label: z.string() }), 'about.stats'),
});

export const purposeSchema = z.object({
  label: str('purpose.label'),
  headline: str('purpose.headline'),
  items: arrayOf(z.object({ title: z.string(), body: z.string() }), 'purpose.items'),
});

export const servicesSchema = z.object({
  label: str('services.label'),
  headline: str('services.headline'),
  items: arrayOf(
    z.object({ icon: z.string(), name: z.string(), description: z.string() }),
    'services.items',
  ),
});

export const portfolioSchema = z.object({
  label: str('portfolio.label'),
  headline: str('portfolio.headline'),
  items: arrayOf(
    z.object({
      logo: z.object({ src: z.string(), alt: z.string() }),
      title: z.string(),
      category: z.string(),
      description: z.string().default(''),
    }),
    'portfolio.items',
  ),
});

export const teamSchema = z.object({
  label: str('team.label'),
  headline: str('team.headline'),
  members: arrayOf(
    z.object({
      photo: z.object({ src: z.string(), alt: z.string() }),
      name: z.string(),
      role: z.string(),
      bio: z.string(),
    }),
    'team.members',
  ),
});

export const channelTypeSchema = z.enum([
  'email',
  'phone',
  'whatsapp',
  'address',
  'social',
  'hours',
]);

export const contactSchema = z.object({
  label: str('contact.label'),
  headline: str('contact.headline'),
  channels: arrayOf(
    z.object({
      type: channelTypeSchema,
      label: z.string(),
      value: z.string(),
      href: z.string().optional(),
    }),
    'contact.channels',
  ),
});

export const sectionSchemas = {
  site: siteSchema,
  hero: heroSchema,
  about: aboutSchema,
  purpose: purposeSchema,
  services: servicesSchema,
  portfolio: portfolioSchema,
  team: teamSchema,
  contact: contactSchema,
} as const;

export type SectionName = keyof typeof sectionSchemas;
