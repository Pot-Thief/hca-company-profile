import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { About } from './About';

const props = {
  label: 'LABEL_X',
  headline: 'HEADLINE_X',
  paragraphs: ['PARA_ONE_X', 'PARA_TWO_X'],
  stats: [
    { value: 'VALUE_ONE_X', label: 'STAT_ONE_X' },
    { value: 'VALUE_TWO_X', label: 'STAT_TWO_X' },
    { value: 'VALUE_THREE_X', label: 'STAT_THREE_X' },
  ],
};

describe('About', () => {
  test('renders an h2 from the headline', () => {
    render(<About {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders one paragraph per entry', () => {
    const { container } = render(<About {...props} />);
    expect(container.querySelector('[data-block="paragraphs"]')).not.toBeNull();
    expect(screen.getByText('PARA_ONE_X')).toBeInTheDocument();
    expect(screen.getByText('PARA_TWO_X')).toBeInTheDocument();
  });

  test('renders every stat value and label', () => {
    const { container } = render(<About {...props} />);
    expect(container.querySelector('[data-block="stats"]')).not.toBeNull();
    expect(screen.getByText('VALUE_TWO_X')).toBeInTheDocument();
    expect(screen.getByText('STAT_THREE_X')).toBeInTheDocument();
  });

  test('renders the section with the about id', () => {
    const { container } = render(<About {...props} />);
    expect(container.querySelector('section#about')).not.toBeNull();
  });

  test('omits the stats block when stats is empty but keeps the section', () => {
    const { container } = render(<About {...props} stats={[]} />);
    expect(container.querySelector('[data-block="stats"]')).toBeNull();
    expect(screen.queryByText('STAT_ONE_X')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  test('omits the paragraph block when paragraphs is empty', () => {
    const { container } = render(<About {...props} paragraphs={[]} />);
    expect(container.querySelector('[data-block="paragraphs"]')).toBeNull();
    expect(screen.queryByText('PARA_ONE_X')).not.toBeInTheDocument();
  });

  test('carries the paper surface', () => {
    const { container } = render(<About {...props} />);
    expect(container.querySelector('section#about')).not.toHaveAttribute('data-surface');
  });
});
