import { describe, expect, test, vi } from 'vitest';
import { sectionSchemas, contactSchema, servicesSchema, portfolioSchema } from './schema';

describe('every schema parses an empty object', () => {
  test.each(Object.entries(sectionSchemas))('%s', (_name, schema) => {
    expect(() => schema.parse({})).not.toThrow();
  });
});

describe('services schema', () => {
  test('keeps valid items', () => {
    const parsed = servicesSchema.parse({
      headline: 'H',
      items: [{ icon: 'code', name: 'N', description: 'D' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.icon).toBe('code');
  });

  test('drops an item missing required keys and keeps the rest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parsed = servicesSchema.parse({
      items: [{ icon: 'code', name: 'N', description: 'D' }, { icon: 'code' }],
    });
    expect(parsed.items).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('ignores unknown keys', () => {
    const parsed = servicesSchema.parse({ headline: 'H', somethingElse: true });
    expect(parsed).not.toHaveProperty('somethingElse');
  });

  test('falls back and warns when headline has the wrong type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(servicesSchema.parse({ headline: 42 }).headline).toBe('');
    expect(warn).toHaveBeenCalled();
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
    expect(warn).toHaveBeenCalled();
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
