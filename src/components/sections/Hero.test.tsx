import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Hero } from './Hero';

const props = {
  eyebrow: 'EYEBROW_X',
  headline: 'HEADLINE_X',
  subheadline: 'SUBHEADLINE_X',
  backgroundImage: { src: '/assets/images/hero-bg.jpg', alt: 'ALT_X' },
  actions: [
    { label: 'PRIMARY_X', href: '#services', variant: 'primary' as const },
    { label: 'GHOST_X', href: '#contact', variant: 'ghost' as const },
  ],
};

describe('Hero', () => {
  test('renders the headline as the only h1', () => {
    render(<Hero {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders eyebrow and subheadline from props', () => {
    render(<Hero {...props} />);
    expect(screen.getByText('EYEBROW_X')).toBeInTheDocument();
    expect(screen.getByText('SUBHEADLINE_X')).toBeInTheDocument();
  });

  test('renders no eyebrow element when the eyebrow is empty', () => {
    render(<Hero {...props} eyebrow="" />);
    expect(screen.queryByText('EYEBROW_X')).not.toBeInTheDocument();
  });

  test('renders no subheadline element when the subheadline is empty', () => {
    render(<Hero {...props} subheadline="" />);
    expect(screen.queryByText('SUBHEADLINE_X')).not.toBeInTheDocument();
  });

  test('renders one link per action with its href', () => {
    render(<Hero {...props} />);
    expect(screen.getByRole('link', { name: 'PRIMARY_X' })).toHaveAttribute('href', '#services');
    expect(screen.getByRole('link', { name: 'GHOST_X' })).toHaveAttribute('href', '#contact');
  });

  test('renders no links when actions is empty', () => {
    render(<Hero {...props} actions={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  test('uses the alt text from props for the background image', () => {
    render(<Hero {...props} />);
    expect(screen.getByAltText('ALT_X')).toBeInTheDocument();
  });
});
