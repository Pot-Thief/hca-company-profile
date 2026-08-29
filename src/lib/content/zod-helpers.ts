import { z } from 'zod';
import { warnContent } from './warn';

// .default() short-circuits on `undefined` before the inner schema ever runs, so a missing
// field never reaches .catch(). Only a present-but-wrong-typed value fails the inner parse
// and lands in .catch(), which is what triggers the warning. Swapping the order (or dropping
// .default()) would make missing fields warn too, or wrong-typed fields warn twice.
export function field<S extends z.ZodTypeAny>(
  schema: S,
  fallback: z.core.util.NoUndefined<z.output<S>>,
  path: string,
) {
  return schema.default(fallback).catch(() => {
    warnContent(path, 'wrong type, using fallback');
    return fallback;
  });
}

export function arrayOf<S extends z.ZodTypeAny>(item: S, path: string) {
  return z
    .array(z.unknown())
    .default([])
    .catch(() => {
      warnContent(path, 'expected an array, using an empty list');
      return [];
    })
    .transform((raw): z.output<S>[] => {
      const kept: z.output<S>[] = [];
      const dropped: number[] = [];
      raw.forEach((entry, index) => {
        const result = item.safeParse(entry);
        if (result.success) kept.push(result.data);
        else dropped.push(index);
      });
      if (dropped.length > 0) {
        warnContent(
          path,
          `dropped ${dropped.length} invalid item(s) at index ${dropped.join(', ')}`,
        );
      }
      return kept;
    });
}
