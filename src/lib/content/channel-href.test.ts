import { describe, expect, test } from 'vitest';
import { channelHref } from './channel-href';

describe('channelHref', () => {
  test('builds a mailto link', () => {
    expect(channelHref('email', 'hello@placeholder.test')).toBe('mailto:hello@placeholder.test');
  });

  test('builds a tel link with separators removed', () => {
    expect(channelHref('phone', '+62 (21) 555-0100')).toBe('tel:+62215550100');
  });

  test('builds a wa.me link with digits only', () => {
    expect(channelHref('whatsapp', '+62 812-0000-0000')).toBe('https://wa.me/6281200000000');
  });

  test('passes a social url through unchanged', () => {
    expect(channelHref('social', 'https://example.test/profile')).toBe(
      'https://example.test/profile',
    );
  });

  test('returns undefined for an address without an explicit href', () => {
    expect(channelHref('address', 'Placeholder Street 1')).toBeUndefined();
  });

  test('returns undefined for hours', () => {
    expect(channelHref('hours', 'Mon to Fri, 09.00 to 17.00')).toBeUndefined();
  });

  test('an explicit href wins over the derived value', () => {
    expect(channelHref('email', 'hello@placeholder.test', 'https://forms.example/x')).toBe(
      'https://forms.example/x',
    );
    expect(channelHref('address', 'Placeholder Street 1', 'https://maps.example/x')).toBe(
      'https://maps.example/x',
    );
  });
});
