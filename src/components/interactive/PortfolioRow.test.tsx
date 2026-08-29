import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { PortfolioRow } from './PortfolioRow';

const item = {
  logo: { src: '/assets/images/portfolio-01.png', alt: 'LOGO_ALT_X' },
  title: 'TITLE_X',
  category: 'CATEGORY_X',
  description: 'DESC_X',
};

describe('PortfolioRow', () => {
  test('starts collapsed with aria-expanded false', () => {
    render(<PortfolioRow item={item} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking reveals the description and flips aria-expanded', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('DESC_X')).toBeVisible();
  });

  test('opens with the keyboard', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('renders no button when the description is empty', () => {
    render(<PortfolioRow item={{ ...item, description: '' }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('TITLE_X')).toBeInTheDocument();
  });
});
