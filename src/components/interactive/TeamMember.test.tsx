import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { TeamMember } from './TeamMember';

const member = {
  photo: { src: '/assets/images/team-01.jpg', alt: 'PHOTO_ALT_X' },
  name: 'NAME_X',
  role: 'ROLE_X',
  bio: 'BIO_X',
};

const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};

describe('TeamMember', () => {
  test('the bio is collapsed and the trigger is named from ui plus the member name', () => {
    render(<TeamMember member={member} ui={ui} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAccessibleName('EXPAND_BIO_X NAME_X');
  });

  test('activating the trigger reveals the bio and renames the trigger', async () => {
    const user = userEvent.setup();
    render(<TeamMember member={member} ui={ui} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('COLLAPSE_BIO_X NAME_X');
    expect(screen.getByText('BIO_X')).toBeVisible();
  });

  test('opens with the keyboard', async () => {
    const user = userEvent.setup();
    render(<TeamMember member={member} ui={ui} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('name and role are visible without expanding', () => {
    render(<TeamMember member={member} ui={ui} />);
    expect(screen.getByRole('heading', { level: 3, name: 'NAME_X' })).toBeInTheDocument();
    expect(screen.getByText('ROLE_X')).toBeInTheDocument();
  });
});
