import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { GridLines } from './GridLines';

describe('GridLines', () => {
  // The grid describes the layout rather than decorating it, so a block without
  // a rail must not draw a rail line. Drawing one everywhere would mark a column
  // that does not exist, which is the wallpaper failure the research warns about.
  test('draws the two container edges by default', () => {
    const { container } = render(<GridLines />);
    expect(container.querySelectorAll('[data-grid-line]')).toHaveLength(2);
  });

  test('draws the rail boundary as a third line when the block has a rail', () => {
    const { container } = render(<GridLines rail />);
    expect(container.querySelectorAll('[data-grid-line]')).toHaveLength(3);
  });

  test('is hidden from assistive technology', () => {
    const { container } = render(<GridLines />);
    expect(container.querySelector('[data-grid]')).toHaveAttribute('aria-hidden', 'true');
  });
});
