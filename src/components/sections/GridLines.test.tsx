import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { GridLines } from './GridLines';

describe('GridLines', () => {
  // Two, not three. The rail boundary used to be drawn as well, which put a pair
  // of lines in the narrow space beside every section title. A count assertion is
  // what keeps a third from creeping back.
  test('draws the two container edges', () => {
    const { container } = render(<GridLines />);
    expect(container.querySelectorAll('[data-grid-line]')).toHaveLength(2);
  });

  test('is hidden from assistive technology', () => {
    const { container } = render(<GridLines />);
    expect(container.querySelector('[data-grid]')).toHaveAttribute('aria-hidden', 'true');
  });
});
