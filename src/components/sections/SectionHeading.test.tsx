import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  test('renders the headline as an h2', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="HEADLINE_X" />);
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders the label alongside the headline', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="HEADLINE_X" />);
    expect(screen.getByText('LABEL_X')).toBeInTheDocument();
  });

  test('falls back to the label when the headline is empty', () => {
    render(<SectionHeading id="services" label="LABEL_X" headline="" />);
    expect(screen.getByRole('heading', { level: 2, name: 'LABEL_X' })).toBeInTheDocument();
  });

  test('falls back to the id when both are empty', () => {
    render(<SectionHeading id="services" label="" headline="" />);
    expect(screen.getByRole('heading', { level: 2, name: 'services' })).toBeInTheDocument();
  });

  test('renders no label element when the label is empty', () => {
    const { container } = render(<SectionHeading id="services" label="" headline="HEADLINE_X" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
