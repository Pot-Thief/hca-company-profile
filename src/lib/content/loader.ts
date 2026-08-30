import fs from 'node:fs';
import path from 'node:path';
import type { z } from 'zod';
import type { SectionName } from './schema';
import { warnContent } from './warn';

export function contentBase(): string {
  const explicit = process.env.CONTENT_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}/data`;
  // The app serves its own content out of public/data, so the base has to
  // follow the port the server was actually started on. This was pinned to 3000
  // and the E2E and Lighthouse servers were later moved to 3300 and 3200, which
  // left a production build quietly fetching its content from whatever answered
  // on 3000 — a developer's `next dev`. It passed locally for exactly that
  // reason and could never have passed on a machine without one. PORT is the
  // same variable `next start` reads, so the server and its content cannot
  // disagree about which port they are on.
  // `||`, not `??`: an empty PORT is what a shell leaves behind when a variable
  // is exported without a value, and `??` would keep it, yielding
  // `http://localhost:/data`. The two checks above already treat empty as unset.
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}/data`;
}

function revalidateSeconds(): number {
  const raw = Number(process.env.CONTENT_REVALIDATE);
  return Number.isFinite(raw) && raw >= 0 ? raw : 60;
}

function readFromDisk(file: string): unknown | undefined {
  try {
    const diskPath = path.join(process.cwd(), 'public', 'data', file);
    if (fs.existsSync(diskPath)) {
      return JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
    }
  } catch {
    // Return undefined if reading disk file fails
  }
  return undefined;
}

export async function loadSection<S extends z.ZodType>(
  name: SectionName,
  schema: S,
): Promise<z.output<S>> {
  const file = `${name}.json`;
  const url = `${contentBase()}/${file}`;
  const fallback = schema.parse({});

  let raw: unknown;
  let fetchFailed = false;

  try {
    const response = await fetch(url, { next: { revalidate: revalidateSeconds() } });
    if (!response.ok) {
      warnContent(file, `fetch returned ${response.status} for ${url}`);
      fetchFailed = true;
    } else {
      raw = await response.json();
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    warnContent(file, `could not read ${url}: ${reason}`);
    fetchFailed = true;
  }

  if (fetchFailed) {
    const diskContent = readFromDisk(file);
    if (diskContent !== undefined) {
      const result = schema.safeParse(diskContent);
      if (result.success) return result.data;
    }
    return fallback;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    warnContent(file, `does not match the expected shape: ${result.error.message}`);
    return fallback;
  }
  return result.data;
}
