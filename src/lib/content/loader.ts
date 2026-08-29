import type { z } from 'zod';
import type { SectionName } from './schema';
import { warnContent } from './warn';

export function contentBase(): string {
  const explicit = process.env.CONTENT_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}/data`;
  return 'http://localhost:3000/data';
}

function revalidateSeconds(): number {
  const raw = Number(process.env.CONTENT_REVALIDATE);
  return Number.isFinite(raw) && raw >= 0 ? raw : 60;
}

export async function loadSection<S extends z.ZodType>(
  name: SectionName,
  schema: S,
): Promise<z.output<S>> {
  const file = `${name}.json`;
  const url = `${contentBase()}/${file}`;
  const fallback = schema.parse({});

  let raw: unknown;
  try {
    const response = await fetch(url, { next: { revalidate: revalidateSeconds() } });
    if (!response.ok) {
      warnContent(file, `fetch returned ${response.status} for ${url}`);
      return fallback;
    }
    raw = await response.json();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    warnContent(file, `could not read ${url}: ${reason}`);
    return fallback;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    warnContent(file, `does not match the expected shape: ${result.error.message}`);
    return fallback;
  }
  return result.data;
}
