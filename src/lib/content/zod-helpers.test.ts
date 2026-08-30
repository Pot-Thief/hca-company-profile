import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { arrayOf, field } from './zod-helpers';

describe('field', () => {
  test('returns the parsed value when input is valid', () => {
    const schema = z.object({ a: field(z.string(), '', 'x.a') });
    expect(schema.parse({ a: 'hello' })).toEqual({ a: 'hello' });
  });

  test('falls back silently when the field is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ a: field(z.string(), 'fallback', 'x.a') });
    expect(schema.parse({})).toEqual({ a: 'fallback' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('falls back and warns when the field has the wrong type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ a: field(z.string(), 'fallback', 'x.a') });
    expect(schema.parse({ a: 123 })).toEqual({ a: 'fallback' });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('x.a');
    warn.mockRestore();
  });
});

describe('arrayOf', () => {
  const item = z.object({ id: z.string() });

  test('keeps every valid element', () => {
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: [{ id: 'a' }, { id: 'b' }] })).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
    });
  });

  test('drops invalid elements, keeps the rest, and warns once with the indices', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: [{ id: 'a' }, { id: 7 }, { id: 'b' }, { id: 8 }] })).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
    });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('at index 1, 3');
    warn.mockRestore();
  });

  test('falls back to an empty array and warns when the value is not an array', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({ items: 'nope' })).toEqual({ items: [] });
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('x.items');
    warn.mockRestore();
  });

  test('defaults to an empty array silently when the key is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = z.object({ items: arrayOf(item, 'x.items') });
    expect(schema.parse({})).toEqual({ items: [] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
