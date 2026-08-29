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

  test('carries the ink surface', () => {
    const { container } = render(<Purpose {...props} />);
    expect(container.querySelector('section#purpose')).toHaveAttribute('data-surface', 'ink');
  });

  test('keeps hairline borders sane with an odd, five-item count', () => {
    const fiveItems = [1, 2, 3, 4, 5].map((n) => ({ title: `TITLE_${n}_X`, body: `BODY_${n}_X` }));
    const { container } = render(<Purpose {...props} items={fiveItems} />);
    const cells = container.querySelectorAll('[data-block="items"] > div');
    expect(cells).toHaveLength(5);

    for (const cell of cells) {
      const classes = cell.className.split(' ');
      const sides = [
        ['border-t', 'md:border-t'],
        ['border-r', 'md:border-r'],
        ['border-b', 'md:border-b'],
        ['border-l', 'md:border-l'],
      ];
      const borderedSides = sides.filter(([base, md]) =>
        classes.some((c) => c === base || c === md),
      );
      expect(borderedSides.length).toBeLessThan(4);
    }
  });
});
