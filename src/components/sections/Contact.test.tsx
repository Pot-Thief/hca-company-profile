import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Contact } from './Contact';
import { uiLabels as ui } from '@/lib/content/ui-fixture';

const props = {
  label: 'LABEL_X',
  headline: 'HEADLINE_X',
  ui,
  channels: [
    { type: 'email' as const, label: 'EMAIL_LABEL_X', value: 'a@placeholder.test' },
    { type: 'phone' as const, label: 'PHONE_LABEL_X', value: '+62 21 0000 0000' },
    { type: 'whatsapp' as const, label: 'WA_LABEL_X', value: '+62 812 3456 7890' },
    { type: 'address' as const, label: 'ADDRESS_LABEL_X', value: 'ADDRESS_VALUE_X' },
    { type: 'hours' as const, label: 'HOURS_LABEL_X', value: 'HOURS_VALUE_X' },
    { type: 'social' as const, label: 'SOCIAL_LABEL_X', value: 'https://social.example/x' },
  ],
};

describe('Contact', () => {
  test('renders a mailto link for email', () => {
    render(<Contact {...props} />);
    expect(screen.getByRole('link', { name: /a@placeholder.test/ })).toHaveAttribute(
      'href',
      'mailto:a@placeholder.test',
    );
  });

  test('renders tel and wa.me links with separators removed', () => {
    render(<Contact {...props} />);
    expect(screen.getByRole('link', { name: /0000 0000/ })).toHaveAttribute(
      'href',
      'tel:+622100000000',
    );
    expect(screen.getByRole('link', { name: /812 3456 7890/ })).toHaveAttribute(
      'href',
      'https://wa.me/6281234567890',
    );
  });

  test('renders address and hours as text, not links', () => {
    render(<Contact {...props} />);
    expect(screen.queryByRole('link', { name: /ADDRESS_VALUE_X/ })).not.toBeInTheDocument();
    expect(screen.getByText('ADDRESS_VALUE_X')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /HOURS_VALUE_X/ })).not.toBeInTheDocument();
    expect(screen.getByText('HOURS_VALUE_X')).toBeInTheDocument();
  });

  test('renders an address link when an explicit href is given', () => {
    const channels = [
      {
        type: 'address' as const,
        label: 'A_X',
        value: 'ADDRESS_VALUE_X',
        href: 'https://maps.example/x',
      },
    ];
    render(<Contact {...props} channels={channels} />);
    expect(screen.getByRole('link', { name: /ADDRESS_VALUE_X/ })).toHaveAttribute(
      'href',
      'https://maps.example/x',
    );
  });

  test('renders a copy button only for email, phone, and whatsapp', () => {
    render(<Contact {...props} />);
    expect(screen.getAllByRole('button', { name: /^COPY_X / })).toHaveLength(3);
  });

  test('marks the channel list as the channels block', () => {
    const { container } = render(<Contact {...props} />);
    expect(container.querySelector('[data-block="channels"]')).toBeInTheDocument();
  });

  test('contains no form and no input', () => {
    const { container } = render(<Contact {...props} />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  test('renders an empty state when channels is empty', () => {
    render(<Contact {...props} channels={[]} />);
    expect(
      screen.getByText('No contact channels yet. Add channels to contact.json.'),
    ).toBeInTheDocument();
  });

  test('has no channels block when channels is empty', () => {
    const { container } = render(<Contact {...props} channels={[]} />);
    expect(container.querySelector('[data-block="channels"]')).not.toBeInTheDocument();
  });

  test('carries the ink surface', () => {
    const { container } = render(<Contact {...props} />);
    expect(container.querySelector('section')).toHaveAttribute('data-surface', 'ink');
  });
});
