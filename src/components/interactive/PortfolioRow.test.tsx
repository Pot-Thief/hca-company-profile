import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { PortfolioRow } from './PortfolioRow';
import { uiLabels as ui } from '@/lib/content/ui-fixture';

const item = {
  logo: { src: '/assets/images/portfolio-01.png', alt: 'LOGO_ALT_X' },
  title: 'TITLE_X',
  category: 'CATEGORY_X',
  description: 'DESC_X',
};

describe('PortfolioRow', () => {
  test('starts collapsed with aria-expanded false', () => {
    render(<PortfolioRow item={item} ui={ui} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking reveals the description and flips aria-expanded', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} ui={ui} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('DESC_X')).toBeVisible();
  });

  test('opens with the keyboard', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} ui={ui} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('renders no button when the description is empty', () => {
    render(<PortfolioRow item={{ ...item, description: '' }} ui={ui} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('TITLE_X')).toBeInTheDocument();
  });

  // Nothing on the row said it opened. aria-expanded tells a screen reader, and
  // the hover tint tells whoever already happens to be pointing at it, but a
  // sighted reader scanning the page had no way to know the row was a control.
  test('names the action so the row reads as a control', () => {
    render(<PortfolioRow item={item} ui={ui} />);
    expect(screen.getByText('EXPAND_PROJECT_X')).toBeInTheDocument();
  });

  test('flips the action label to the collapse wording once open', async () => {
    const user = userEvent.setup();
    render(<PortfolioRow item={item} ui={ui} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('COLLAPSE_PROJECT_X')).toBeInTheDocument();
    expect(screen.queryByText('EXPAND_PROJECT_X')).not.toBeInTheDocument();
  });

  test('shows no action label on a row that does not open', () => {
    render(<PortfolioRow item={{ ...item, description: '' }} ui={ui} />);
    expect(screen.queryByText('EXPAND_PROJECT_X')).not.toBeInTheDocument();
    expect(screen.queryByText('COLLAPSE_PROJECT_X')).not.toBeInTheDocument();
  });
});
