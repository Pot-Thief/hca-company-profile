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
    const { container } = render(<Hero {...props} eyebrow="" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent('SUBHEADLINE_X');
  });

  test('renders no subheadline element when the subheadline is empty', () => {
    const { container } = render(<Hero {...props} subheadline="" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent('EYEBROW_X');
  });

  test('renders one link per action with its href', () => {
    render(<Hero {...props} />);
    expect(screen.getByRole('link', { name: 'PRIMARY_X' })).toHaveAttribute('href', '#services');
    expect(screen.getByRole('link', { name: 'GHOST_X' })).toHaveAttribute('href', '#contact');
  });

  test('renders the actions wrapper when there are actions', () => {
    const { container } = render(<Hero {...props} />);
    expect(container.querySelector('[data-block="actions"]')).not.toBeNull();
  });

  test('renders no links and no actions wrapper when actions is empty', () => {
    const { container } = render(<Hero {...props} actions={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    // A wrapper rendered around an empty map would still report zero links, so
    // the count above cannot catch it alone. The attribute survives restyling,
    // which a class selector does not.
    expect(container.querySelector('[data-block="actions"]')).toBeNull();
  });

  test('uses the alt text from props for the background image', () => {
    render(<Hero {...props} />);
    expect(screen.getByAltText('ALT_X')).toBeInTheDocument();
  });
});
