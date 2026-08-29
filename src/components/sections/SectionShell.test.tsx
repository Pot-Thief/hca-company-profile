import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SectionShell } from './SectionShell';

describe('SectionShell', () => {
  test('renders the headline as an h2', () => {
    render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X">
        CHILD_X
      </SectionShell>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'HEADLINE_X' })).toBeInTheDocument();
  });

  test('renders the label alongside the headline', () => {
    render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X">
        CHILD_X
      </SectionShell>,
    );
    expect(screen.getByText('LABEL_X')).toBeInTheDocument();
  });

  test('falls back to the label when the headline is empty', () => {
    render(
      <SectionShell id="services" label="LABEL_X" headline="">
        CHILD_X
      </SectionShell>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'LABEL_X' })).toBeInTheDocument();
  });

  test('falls back to the id when both are empty', () => {
    render(
      <SectionShell id="services" label="" headline="">
        CHILD_X
      </SectionShell>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'services' })).toBeInTheDocument();
  });

  test('renders no label element when the label is empty', () => {
    const { container } = render(
      <SectionShell id="services" label="" headline="HEADLINE_X">
        CHILD_X
      </SectionShell>,
    );
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  test('renders children in the content column', () => {
    render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X">
        <span>CHILD_X</span>
      </SectionShell>,
    );
    expect(screen.getByText('CHILD_X')).toBeInTheDocument();
  });

  test('keeps the given id on the section element', () => {
    const { container } = render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X">
        CHILD_X
      </SectionShell>,
    );
    expect(container.querySelector('section#services')).not.toBeNull();
  });

  test('carries no data-surface attribute by default', () => {
    const { container } = render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X">
        CHILD_X
      </SectionShell>,
    );
    expect(container.querySelector('section')).not.toHaveAttribute('data-surface');
  });

  test('carries data-surface="ink" when surface is ink', () => {
    const { container } = render(
      <SectionShell id="services" label="LABEL_X" headline="HEADLINE_X" surface="ink">
        CHILD_X
      </SectionShell>,
    );
    expect(container.querySelector('section')).toHaveAttribute('data-surface', 'ink');
  });
});
