import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { MobileNav } from './MobileNav';
import { uiLabels } from '@/lib/content/ui-fixture';

const props = {
  nav: [{ label: 'NAV_ONE_X', href: '#about' }],
  cta: { label: 'CTA_X', href: '#contact' },
  ui: uiLabels,
};

describe('MobileNav', () => {
  test('the trigger is named from the ui labels, not from the component', () => {
    render(<MobileNav {...props} />);
    expect(screen.getByRole('button', { name: 'MENU_X' })).toBeInTheDocument();
  });

  test('opening the panel reveals every nav link and the cta', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    expect(await screen.findByRole('link', { name: 'NAV_ONE_X' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CTA_X' })).toBeInTheDocument();
  });

  test('the close control is named from the ui labels', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    expect(await screen.findByRole('button', { name: 'CLOSE_MENU_X' })).toBeInTheDocument();
  });

  test('escape closes the panel', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('link', { name: 'NAV_ONE_X' })).not.toBeInTheDocument();
  });

  // Every link here jumps to a section on this same page, so leaving the panel
  // open leaves it covering the exact thing the reader asked to see. Nothing
  // closed it: the sheet was uncontrolled, and a hash change is not a navigation
  // the sheet can notice.
  test('choosing a nav link closes the panel', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    await user.click(await screen.findByRole('link', { name: 'NAV_ONE_X' }));
    expect(screen.queryByRole('link', { name: 'NAV_ONE_X' })).not.toBeInTheDocument();
  });

  test('choosing the cta closes the panel', async () => {
    const user = userEvent.setup();
    render(<MobileNav {...props} />);
    await user.click(screen.getByRole('button', { name: 'MENU_X' }));
    await user.click(await screen.findByRole('link', { name: 'CTA_X' }));
    expect(screen.queryByRole('link', { name: 'CTA_X' })).not.toBeInTheDocument();
  });
});
