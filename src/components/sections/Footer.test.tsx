import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Footer } from './Footer';

const props = {
  logo: { wordmark: 'WORDMARK_X' },
  nav: [{ label: 'FOOTER_NAV_X', href: '#services' }],
  copyright: 'COPYRIGHT_X',
  social: [
    { type: 'social' as const, label: 'SOCIAL_ONE_X', value: 'https://social.example/one' },
    { type: 'social' as const, label: 'SOCIAL_TWO_X', value: 'https://social.example/two' },
  ],
};

describe('Footer', () => {
  test('is a contentinfo landmark', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders wordmark, nav, and copyright from props', () => {
    render(<Footer {...props} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FOOTER_NAV_X' })).toHaveAttribute('href', '#services');
    expect(screen.getByText('COPYRIGHT_X')).toBeInTheDocument();
  });

  test('renders one link per social channel', () => {
    const { container } = render(<Footer {...props} />);
    expect(container.querySelector('[data-block="social"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'SOCIAL_ONE_X' })).toHaveAttribute(
      'href',
      'https://social.example/one',
    );
    expect(screen.getByRole('link', { name: 'SOCIAL_TWO_X' })).toHaveAttribute(
      'href',
      'https://social.example/two',
    );
  });

  test('social links leave the site', () => {
    render(<Footer {...props} />);
    const link = screen.getByRole('link', { name: 'SOCIAL_TWO_X' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  test('renders no social block when the list is empty', () => {
    const { container } = render(<Footer {...props} social={[]} />);
    expect(screen.queryByRole('link', { name: 'SOCIAL_ONE_X' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-block="social"]')).not.toBeInTheDocument();
  });
});
