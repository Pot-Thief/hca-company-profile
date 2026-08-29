import { describe, expect, test, vi } from 'vitest';
import { getIcon, ICON_NAMES } from './icons';

describe('getIcon', () => {
  test('returns a component for every published name', () => {
    for (const name of ICON_NAMES) {
      const icon = getIcon(name);
      expect(icon).not.toBeNull();
      expect(icon).toHaveProperty('render', expect.any(Function));
    }
  });

  test('returns the fallback and warns for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const icon = getIcon('not-a-real-icon');
    expect(icon).not.toBeNull();
    expect(icon).toHaveProperty('render', expect.any(Function));
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('not-a-real-icon');
    warn.mockRestore();
  });

  test('publishes at least twelve names so every service can differ', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(12);
  });
});
