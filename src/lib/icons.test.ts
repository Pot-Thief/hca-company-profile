import { describe, expect, test, vi } from 'vitest';
import { getIcon, ICON_NAMES } from './icons';

describe('getIcon', () => {
  test('returns a component for every published name', () => {
    for (const name of ICON_NAMES) {
      expect(getIcon(name)).toBeTypeOf('object');
    }
  });

  test('returns the fallback and warns for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getIcon('not-a-real-icon')).toBeTypeOf('object');
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('not-a-real-icon');
    warn.mockRestore();
  });

  test('publishes at least twelve names so every service can differ', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(12);
  });
});
