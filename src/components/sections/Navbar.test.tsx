import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Navbar } from './Navbar';
import { uiLabels as ui } from '@/lib/content/ui-fixture';

const props = {
  logo: { wordmark: 'WORDMARK_X' },
  nav: [
    { label: 'NAV_ONE_X', href: '#about' },
    { label: 'NAV_TWO_X', href: '#services' },
  ],
  cta: { label: 'CTA_X', href: '#contact' },
  ui,
};

describe('Navbar', () => {
  test('renders the wordmark from props', () => {
    render(<Navbar {...props} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
  });

  test('renders one link per nav item with its href', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('link', { name: 'NAV_ONE_X' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'NAV_TWO_X' })).toHaveAttribute('href', '#services');
  });

  test('renders the cta link', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('link', { name: 'CTA_X' })).toHaveAttribute('href', '#contact');
  });

  test('renders wordmark and cta when nav is empty', () => {
    render(<Navbar {...props} nav={[]} />);
    expect(screen.getByText('WORDMARK_X')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CTA_X' })).toBeInTheDocument();
  });

  test('is a banner landmark', () => {
    render(<Navbar {...props} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
