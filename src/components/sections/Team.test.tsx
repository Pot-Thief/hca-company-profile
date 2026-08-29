import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Team } from './Team';

const members = [1, 2].map((n) => ({
  photo: { src: `/assets/images/team-0${n}.jpg`, alt: `PHOTO_ALT_${n}_X` },
  name: `NAME_${n}_X`,
  role: `ROLE_${n}_X`,
  bio: `BIO_${n}_X`,
}));
const ui = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
};
const props = { label: 'LABEL_X', headline: 'HEADLINE_X', members, ui };

describe('Team', () => {
  test('renders both members as h3 with role and photo alt', () => {
    render(<Team {...props} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 3, name: 'NAME_2_X' })).toBeInTheDocument();
    expect(screen.getByText('ROLE_2_X')).toBeInTheDocument();
    expect(screen.getByAltText('PHOTO_ALT_2_X')).toBeInTheDocument();
  });

  test('renders the section with the team id', () => {
    const { container } = render(<Team {...props} />);
    expect(container.querySelector('section#team')).not.toBeNull();
  });

  test('renders a members block only when members has entries', () => {
    const { container } = render(<Team {...props} />);
    expect(container.querySelector('[data-block="members"]')).not.toBeNull();
  });

  test('renders no members block when members is empty', () => {
    const { container } = render(<Team {...props} members={[]} />);
    expect(container.querySelector('[data-block="members"]')).toBeNull();
  });

  test('renders an empty state when members is empty', () => {
    render(<Team {...props} members={[]} />);
    expect(screen.getByText('No team members yet. Add members to team.json.')).toBeInTheDocument();
  });
});
