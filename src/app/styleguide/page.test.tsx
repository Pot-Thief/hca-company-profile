import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

describe('styleguide page', () => {
  test('renders the token sections in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { default: Page } = await import('./page');
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('paper')).toBeInTheDocument();
    expect(screen.getByText('void')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  test('is not found in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { default: Page } = await import('./page');
    expect(() => render(<Page />)).toThrow('NEXT_NOT_FOUND');
    vi.unstubAllEnvs();
  });
});
