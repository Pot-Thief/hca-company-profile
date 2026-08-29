import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Services } from './Services';

const items = Array.from({ length: 12 }, (_, i) => ({
  icon: 'code',
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

  test('renders an icon for each item', () => {
    const { container } = render(<Services {...props} />);
    expect(container.querySelectorAll('svg')).toHaveLength(12);
  });

  test('icons are hidden from assistive technology', () => {
    const { container } = render(<Services {...props} />);
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('an unknown icon name renders the fallback and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Services {...props} items={[{ icon: 'nope-x', name: 'N_X', description: 'D_X' }]} />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
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
});
