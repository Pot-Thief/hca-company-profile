import { describe, expect, test, vi } from 'vitest';
import {
  sectionSchemas,
  siteSchema,
  heroSchema,
  aboutSchema,
  purposeSchema,
  servicesSchema,
  portfolioSchema,
  teamSchema,
  contactSchema,
} from './schema';

describe('every schema parses an empty object', () => {
  test.each(Object.entries(sectionSchemas))('%s', (_name, schema) => {
    expect(() => schema.parse({})).not.toThrow();
  });
});

describe('parsing an empty object never warns', () => {
  test.each(Object.entries(sectionSchemas))('%s', (_name, schema) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    schema.parse({});
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('array items: an invalid entry is dropped, the valid one is kept', () => {
  interface ArrayDropRow {
    name: string;
    buildKept: () => unknown;
    expected: unknown;
  }

  const rows: ArrayDropRow[] = [
    {
      name: 'site / nav / item missing href',
      buildKept: () =>
        siteSchema.parse({
          nav: [{ label: 'Home', href: '/' }, { label: 'Bad' }],
        }).nav,
      expected: [{ label: 'Home', href: '/' }],
    },
    {
      name: 'hero / actions / item missing href',
      buildKept: () =>
        heroSchema.parse({
          actions: [{ label: 'Go', href: '/go', variant: 'primary' }, { label: 'Bad' }],
        }).actions,
      expected: [{ label: 'Go', href: '/go', variant: 'primary' }],
    },
    {
      name: 'about / paragraphs / a non-string element',
      buildKept: () => aboutSchema.parse({ paragraphs: ['Valid text', 42] }).paragraphs,
      expected: ['Valid text'],
    },
    {
      name: 'about / stats / item missing label',
      buildKept: () =>
        aboutSchema.parse({
          stats: [{ value: '10', label: 'Years' }, { value: '20' }],
        }).stats,
      expected: [{ value: '10', label: 'Years' }],
    },
    {
      name: 'purpose / items / item missing body',
      buildKept: () =>
        purposeSchema.parse({
          items: [{ title: 'T1', body: 'B1' }, { title: 'T2' }],
        }).items,
      expected: [{ title: 'T1', body: 'B1' }],
    },
    {
      name: 'services / items / item missing description',
      buildKept: () =>
        servicesSchema.parse({
          items: [{ name: 'N1', description: 'D1' }, { name: 'N2' }],
        }).items,
      expected: [{ name: 'N1', description: 'D1' }],
    },
    {
      name: 'portfolio / items / item missing category',
      buildKept: () =>
        portfolioSchema.parse({
          items: [
            {
              logo: { src: '/a.png', alt: 'A' },
              title: 'T1',
              category: 'C1',
              description: 'Desc1',
            },
            { logo: { src: '/b.png', alt: 'B' }, title: 'T2' },
          ],
        }).items,
      expected: [
        { logo: { src: '/a.png', alt: 'A' }, title: 'T1', category: 'C1', description: 'Desc1' },
      ],
    },
    {
      name: 'team / members / item missing name',
      buildKept: () =>
        teamSchema.parse({
          members: [
            { photo: { src: '/a.png', alt: 'A' }, name: 'Ann', role: 'CEO', bio: 'Bio1' },
            { photo: { src: '/b.png', alt: 'B' }, role: 'CTO', bio: 'Bio2' },
          ],
        }).members,
      expected: [{ photo: { src: '/a.png', alt: 'A' }, name: 'Ann', role: 'CEO', bio: 'Bio1' }],
    },
    {
      name: 'contact / channels / item missing value',
      buildKept: () =>
        contactSchema.parse({
          channels: [
            { type: 'email', label: 'Email', value: 'a@b.co' },
            { type: 'phone', label: 'Phone' },
          ],
        }).channels,
      expected: [{ type: 'email', label: 'Email', value: 'a@b.co' }],
    },
  ];

  test.each(rows)('$name', ({ buildKept, expected }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(buildKept()).toEqual(expected);
    warn.mockRestore();
  });

  // site.footer.nav owns the same item shape as site.nav but sits one level down,
  // so it does not fit the flat { [key]: [...] } shape the table above relies on.
  test('site / footer.nav / item missing href (nested)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = siteSchema.parse({
      footer: {
        nav: [{ label: 'Privacy', href: '/privacy' }, { label: 'Bad' }],
      },
    });
    expect(parsed.footer.nav).toEqual([{ label: 'Privacy', href: '/privacy' }]);
    warn.mockRestore();
  });
});

describe('services schema', () => {
  test('keeps valid items', () => {
    const parsed = servicesSchema.parse({
      headline: 'H',
      items: [{ name: 'N', description: 'D' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.name).toBe('N');
  });

  test('drops an item missing required keys and keeps the rest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = servicesSchema.parse({
      items: [{ name: 'N', description: 'D' }, { name: 'N' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('services.items'));
    warn.mockRestore();
  });

  test('ignores unknown keys', () => {
    const parsed = servicesSchema.parse({ headline: 'H', somethingElse: true });
    expect(parsed).not.toHaveProperty('somethingElse');
  });

  test('falls back and warns when headline has the wrong type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(servicesSchema.parse({ headline: 42 }).headline).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('services.headline'));
    warn.mockRestore();
  });
});

describe('site schema', () => {
  test('ui labels fall back to real words rather than empty strings', () => {
    const ui = sectionSchemas.site.parse({}).ui;
    expect(ui.menu).toBe('Menu');
    expect(ui.copy).toBe('Copy');
    expect(ui.expandBio).toBe('Read bio');
  });

  test('ui labels from json win over the defaults', () => {
    const ui = sectionSchemas.site.parse({ ui: { menu: 'MENU_X' } }).ui;
    expect(ui.menu).toBe('MENU_X');
    expect(ui.copy).toBe('Copy');
  });
});

describe('portfolio schema', () => {
  test('description defaults to an empty string', () => {
    const parsed = portfolioSchema.parse({
      items: [{ logo: { src: '/a.png', alt: 'A' }, title: 'T', category: 'C' }],
    });
    expect(parsed.items[0]?.description).toBe('');
  });
});

describe('contact schema', () => {
  test('keeps every known channel type', () => {
    const parsed = contactSchema.parse({
      channels: [
        { type: 'email', label: 'Email', value: 'a@b.co' },
        { type: 'hours', label: 'Hours', value: 'Mon to Fri' },
      ],
    });
    expect(parsed.channels).toHaveLength(2);
  });

  test('drops a channel with an unknown type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = contactSchema.parse({
      channels: [
        { type: 'email', label: 'Email', value: 'a@b.co' },
        { type: 'carrier-pigeon', label: 'Bird', value: 'coo' },
      ],
    });
    expect(parsed.channels).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('contact.channels'));
    warn.mockRestore();
  });

  test('keeps an explicit href when present', () => {
    const parsed = contactSchema.parse({
      channels: [
        { type: 'address', label: 'Office', value: 'Street 1', href: 'https://maps.example/x' },
      ],
    });
    expect(parsed.channels[0]?.href).toBe('https://maps.example/x');
  });
});
