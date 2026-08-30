import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { sectionSchemas } from './schema';

const read = (name: string) =>
  JSON.parse(readFileSync(join(process.cwd(), 'public/data', `${name}.json`), 'utf8'));

describe('shipped content files', () => {
  test.each(Object.entries(sectionSchemas))('%s.json parses with no warnings', (name, schema) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => schema.parse(read(name))).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('the required item counts are present', () => {
    expect(sectionSchemas.purpose.parse(read('purpose')).items).toHaveLength(4);
    expect(sectionSchemas.services.parse(read('services')).items).toHaveLength(12);
    expect(sectionSchemas.portfolio.parse(read('portfolio')).items).toHaveLength(6);
    expect(sectionSchemas.team.parse(read('team')).members).toHaveLength(2);
    expect(sectionSchemas.about.parse(read('about')).stats).toHaveLength(3);
  });

  test('every nav href points at a known section id', () => {
    const ids = ['#about', '#purpose', '#services', '#portfolio', '#team', '#contact'];
    const nav = sectionSchemas.site.parse(read('site')).nav;
    expect(nav).toHaveLength(6);
    for (const item of nav) {
      expect(ids).toContain(item.href);
    }
  });

  // Exact set, not a subset: a key the schema defaults but site.json never
  // declares still renders, silently, and would only surface when someone edits
  // the file looking for a label that is not there.
  test('the ui block is physically present in site.json with every key', () => {
    const raw = read('site');
    expect(Object.keys(raw.ui).sort()).toEqual(
      [
        'closeMenu',
        'collapseBio',
        'collapseProject',
        'copied',
        'copy',
        'expandBio',
        'expandProject',
        'menu',
      ].sort(),
    );
  });
});
