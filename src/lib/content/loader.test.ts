import { z } from 'zod';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { contentBase, loadSection } from './loader';
import { servicesSchema } from './schema';

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
  }) as unknown as Response;

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('contentBase', () => {
  test('prefers CONTENT_BASE_URL and strips a trailing slash', () => {
    vi.stubEnv('CONTENT_BASE_URL', 'https://cdn.example/content/');
    expect(contentBase()).toBe('https://cdn.example/content');
  });

  test('prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'hardycahayaabadi.vercel.app');
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app');
    expect(contentBase()).toBe('https://hardycahayaabadi.vercel.app/data');
  });

  test('falls back to VERCEL_URL', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app');
    expect(contentBase()).toBe('https://preview.vercel.app/data');
  });

  test('falls back to localhost on the default port', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('PORT', '');
    expect(contentBase()).toBe('http://localhost:3000/data');
  });

  // The app serves its own content, so the base must follow the port the server
  // was started on. Pinned to 3000, a build served on any other port fetched
  // from whatever happened to answer on 3000 instead — which on a developer's
  // machine is `next dev`, and on a clean machine is nothing at all.
  test('follows PORT so the server and its content cannot disagree', () => {
    vi.stubEnv('CONTENT_BASE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('PORT', '3300');
    expect(contentBase()).toBe('http://localhost:3300/data');
  });
});

describe('loadSection', () => {
  test('returns parsed data on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse({ headline: 'H', items: [] })),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.headline).toBe('H');
  });

  test('requests the file with a 60 second revalidate', async () => {
    // CONTENT_REVALIDATE is unset here: Number(undefined) is NaN, so this
    // pins the "unset falls back to 60" branch.
    const fetchMock = vi.fn(async () => okResponse({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await loadSection('services', servicesSchema);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/services.json'), {
      next: { revalidate: 60 },
    });
  });

  test('honours a valid CONTENT_REVALIDATE override, including 0', async () => {
    // Pins the "value set to a valid number" branch, and proves the
    // override actually reaches fetch (Task 29 depends on this).
    vi.stubEnv('CONTENT_REVALIDATE', '0');
    const fetchMock = vi.fn(async () => okResponse({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await loadSection('services', servicesSchema);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/services.json'), {
      next: { revalidate: 0 },
    });
  });

  test('falls back to 60 when CONTENT_REVALIDATE is unparseable or negative', async () => {
    // Pins the "unparseable or negative" branch for both sub-cases:
    // Number('not-a-number') is NaN, Number('-5') is a finite negative.
    for (const value of ['not-a-number', '-5']) {
      vi.stubEnv('CONTENT_REVALIDATE', value);
      const fetchMock = vi.fn(async () => okResponse({ items: [] }));
      vi.stubGlobal('fetch', fetchMock);
      await loadSection('services', servicesSchema);
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/services.json'), {
        next: { revalidate: 60 },
      });
    }
  });

  test('falls back and warns on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 }) as Response),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await loadSection('nonexistent' as any, servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent.json'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('404'));
  });
  test('falls back to disk when fetch returns 200 with text/html (Vercel deployment protection)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
            text: async () => '<!DOCTYPE html><html>Login</html>',
          }) as unknown as Response,
      ),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('falls back to disk when fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('falls back to disk when fetch throws a TypeError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('falls back to warning when disk content fails schema validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const strictSchema = z.object({ items: z.array(z.string()).default([]) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await loadSection('services', strictSchema as any);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test('falls back and warns when fetch rejects and file is missing from disk', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await loadSection('nonexistent' as any, servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent.json'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('offline'));
  });

  test('falls back and warns when fetch rejects with a non-Error value', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw 'offline string';
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await loadSection('nonexistent' as any, servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent.json'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('offline string'));
  });

  test('falls back and warns on malformed JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => {
              throw new SyntaxError('Unexpected token');
            },
          }) as unknown as Response,
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await loadSection('nonexistent' as any, servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent.json'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected token'));
  });

  test('falls back and warns when the root is not an object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse('a string')),
    );
    const data = await loadSection('services', servicesSchema);
    expect(data.items).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('services.json'));
  });
});
