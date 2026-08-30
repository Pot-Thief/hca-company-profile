import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Services } from './Services';

const items = Array.from({ length: 12 }, (_, i) => ({
  name: `SERVICE_${i}_X`,
  description: `DESC_${i}_X`,
}));
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', items };

describe('Services', () => {
  test('renders all twelve items', () => {
    render(<Services {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12);
    expect(screen.getByRole('heading', { level: 3, name: 'SERVICE_11_X' })).toBeInTheDocument();
    expect(screen.getByText('DESC_11_X')).toBeInTheDocument();
  });

  // Gate B removed the per-item icons and nothing was lost, so this asserts the
  // absence: twelve generic technology glyphs used as filler is a pattern the
  // design research names, and a stray svg creeping back in would say the
  // decision had been quietly reversed.
  test('renders no decorative icons', () => {
    const { container } = render(<Services {...props} />);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  test('does not number the items', () => {
    render(<Services {...props} />);
    expect(screen.queryByText('01')).not.toBeInTheDocument();
  });

  test('renders an empty state when items is empty', () => {
    render(<Services {...props} items={[]} />);
    expect(screen.getByText('No services yet. Add items to services.json.')).toBeInTheDocument();
  });

  test('renders the section and heading with items present', () => {
    render(<Services {...props} />);
    expect(document.querySelector('section#services')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders the section and heading with items empty', () => {
    render(<Services {...props} items={[]} />);
    expect(document.querySelector('section#services')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('data-block="items" is present when items has entries', () => {
    const { container } = render(<Services {...props} />);
    expect(container.querySelector('[data-block="items"]')).toBeInTheDocument();
  });

  test('data-block="items" is absent when items is empty', () => {
    const { container } = render(<Services {...props} items={[]} />);
    expect(container.querySelector('[data-block="items"]')).not.toBeInTheDocument();
  });

  test('carries the paper surface', () => {
    render(<Services {...props} />);
    expect(document.querySelector('section#services')).not.toHaveAttribute('data-surface');
  });
});
