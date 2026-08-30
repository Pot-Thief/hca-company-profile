import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

// Every `data-block="NAME"` a component sets must be asserted in both
// directions by its test file: present when the block renders, absent when
// it does not. Stating that convention in prose has been missed four times
// in a row, so this scans the source tree and fails mechanically instead.

const COMPONENT_DIRS = ['src/components/sections', 'src/components/interactive'];
const DATA_BLOCK_PATTERN = /data-block="([^"]+)"/g;

function componentFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => join(dir, name));
}

function dataBlockNames(source: string): string[] {
  return [...source.matchAll(DATA_BLOCK_PATTERN)]
    .map((match) => match[1])
    .filter((name): name is string => typeof name === 'string');
}

const findings = COMPONENT_DIRS.flatMap((dir) =>
  componentFiles(dir).flatMap((componentFile) => {
    const source = readFileSync(componentFile, 'utf8');
    const names = new Set(dataBlockNames(source));
    return [...names].map((blockName) => ({
      componentFile,
      testFile: componentFile.replace(/\.tsx$/, '.test.tsx'),
      blockName,
    }));
  }),
);

describe('data-block convention', () => {
  test('at least one data-block was found to check', () => {
    expect(findings.length).toBeGreaterThan(0);
  });

  for (const { componentFile, testFile, blockName } of findings) {
    test(`${componentFile} data-block="${blockName}" is asserted in both directions`, () => {
      const selector = `[data-block="${blockName}"]`;
      let testSource: string;
      try {
        testSource = readFileSync(testFile, 'utf8');
      } catch {
        throw new Error(
          `${componentFile} sets ${selector} but its test file ${testFile} does not exist. ` +
            `Add tests asserting ${selector} is present when the block renders and absent when it does not.`,
        );
      }
      const occurrences = testSource.split(selector).length - 1;
      expect(
        occurrences,
        `${componentFile} sets ${selector}; ${testFile} references it ${occurrences} time(s), ` +
          `needs at least 2 (one asserting it is present when the block renders, one asserting it ` +
          `is absent when the block does not).`,
      ).toBeGreaterThanOrEqual(2);
    });
  }
});
