import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Purpose } from './Purpose';

const items = [1, 2, 3, 4].map((n) => ({ title: `TITLE_${n}_X`, body: `BODY_${n}_X` }));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items };

describe('Purpose', () => {
  test('renders every item as an h3 with its body', () => {
    render(<Purpose {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    expect(screen.getByRole('heading', { level: 3, name: 'TITLE_4_X' })).toBeInTheDocument();
    expect(screen.getByText('BODY_4_X')).toBeInTheDocument();
  });

  test('renders the section with the purpose id', () => {
    const { container } = render(<Purpose {...props} />);
    expect(container.querySelector('section#purpose')).not.toBeNull();
  });

  test('renders an empty state when items is empty', () => {
    render(<Purpose {...props} items={[]} />);
    expect(
      screen.getByText('No purpose statements yet. Add items to purpose.json.'),
    ).toBeInTheDocument();
  });

  test('renders the items block when items has entries', () => {
    const { container } = render(<Purpose {...props} />);
    expect(container.querySelector('[data-block="items"]')).not.toBeNull();
  });

  test('omits the items block when items is empty', () => {
    const { container } = render(<Purpose {...props} items={[]} />);
    expect(container.querySelector('[data-block="items"]')).toBeNull();
    expect(screen.queryByText('TITLE_1_X')).not.toBeInTheDocument();
  });

  test('carries the paper surface', () => {
    const { container } = render(<Purpose {...props} />);
    expect(container.querySelector('section#purpose')).not.toHaveAttribute('data-surface');
  });

  // This replaced an assertion that counted bordered sides and required fewer
  // than four. It could not fail: the cell builder only ever emits border-t,
  // md:border-t and md:border-l, so the count is capped at two and every
  // possible regression still passed. The arithmetic it was meant to guard —
  // which cell is on the first row, which is in the first column, with an odd
  // item count leaving the last row half full — was left completely unguarded.
  //
  // Class names are the assertion here because the class IS the output of that
  // arithmetic, not a styling choice layered on top of it.
  test('draws each cell the rules its position calls for', () => {
    const fiveItems = [1, 2, 3, 4, 5].map((n) => ({ title: `TITLE_${n}_X`, body: `BODY_${n}_X` }));
    const { container } = render(<Purpose {...props} items={fiveItems} />);
    const cells = [...container.querySelectorAll('[data-block="items"] > div')];
    expect(cells).toHaveLength(5);

    const classesAt = (index: number) => new Set(cells[index]?.className.split(' '));

    // Stacked single column below md: every cell but the first is separated
    // from the one above it.
    expect(classesAt(0).has('border-t')).toBe(false);
    for (const index of [1, 2, 3, 4]) {
      expect(classesAt(index).has('border-t'), `cell ${index} needs a stacked rule`).toBe(true);
    }

    // Two columns at md: the top row has nothing above it, so cell 1 cancels
    // the stacked rule it needed while stacked.
    expect(classesAt(1).has('md:border-t-0')).toBe(true);
    expect(classesAt(0).has('md:border-t')).toBe(false);
    expect(classesAt(1).has('md:border-t')).toBe(false);
    for (const index of [2, 3, 4]) {
      expect(classesAt(index).has('md:border-t'), `cell ${index} starts a new row`).toBe(true);
    }

    // The column rule falls between the two columns only, so odd indices carry
    // it and even ones never do — including cell 4, alone on the last row.
    for (const index of [1, 3]) {
      expect(classesAt(index).has('md:border-l'), `cell ${index} is the right column`).toBe(true);
    }
    for (const index of [0, 2, 4]) {
      expect(classesAt(index).has('md:border-l'), `cell ${index} is the left column`).toBe(false);
    }
  });
});
