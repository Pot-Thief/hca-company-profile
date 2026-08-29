import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { MobileNav } from './MobileNav';

const props = {
  nav: [{ label: 'NAV_ONE_X', href: '#about' }],
  cta: { label: 'CTA_X', href: '#contact' },
  ui: {
    menu: 'MENU_X',
    closeMenu: 'CLOSE_MENU_X',
    copy: 'COPY_X',
    copied: 'COPIED_X',
    expandBio: 'EXPAND_BIO_X',
    collapseBio: 'COLLAPSE_BIO_X',
  },
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
});
