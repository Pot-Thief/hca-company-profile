import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Portfolio } from './Portfolio';
import { uiLabels as ui } from '@/lib/content/ui-fixture';

const items = Array.from({ length: 6 }, (_, i) => ({
  logo: { src: `/assets/images/portfolio-0${i + 1}.png`, alt: `LOGO_ALT_${i}_X` },
  title: `TITLE_${i}_X`,
  category: `CATEGORY_${i}_X`,
  description: i < 4 ? `DESC_${i}_X` : '',
}));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items, ui };

describe('Portfolio', () => {
  test('renders the items block when there are items', () => {
    const { container } = render(<Portfolio {...props} />);
    expect(container.querySelector('[data-block="items"]')).not.toBeNull();
  });

  test('renders all six items', () => {
    render(<Portfolio {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });

  test('renders each logo with alt text from props', () => {
    render(<Portfolio {...props} />);
    expect(screen.getByAltText('LOGO_ALT_5_X')).toBeInTheDocument();
  });

  test('renders each category', () => {
    render(<Portfolio {...props} />);
    expect(screen.getByText('CATEGORY_5_X')).toBeInTheDocument();
  });

  test('renders a disclosure only for items that have a description', () => {
    render(<Portfolio {...props} />);
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(4);
  });

  // Four of the six rows open, so exactly four should say so. Asserting the
  // count rather than the presence is what catches the label leaking onto rows
  // that are not controls.
  test('labels the action on exactly the rows that open', () => {
    render(<Portfolio {...props} />);
    expect(screen.getAllByText('EXPAND_PROJECT_X')).toHaveLength(4);
  });

  test('renders an empty state when items is empty', () => {
    const { container } = render(<Portfolio {...props} items={[]} />);
    expect(screen.getByText('No projects yet. Add items to portfolio.json.')).toBeInTheDocument();
    // The empty-state string alone cannot catch a wrapper that renders around
    // an empty map, so the block's absence is asserted structurally too.
    expect(container.querySelector('[data-block="items"]')).toBeNull();
  });
});
