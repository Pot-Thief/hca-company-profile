import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Reveal } from './Reveal';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reveal', () => {
  test('renders its children', () => {
    render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(screen.getByText('CHILD_X')).toBeInTheDocument();
  });

  test('starts in the pending state and carries the data-reveal attribute', () => {
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'pending');
  });

  test('switches to shown when the observer reports an intersection', () => {
    let trigger: ((entries: unknown[]) => void) | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    act(() => {
      trigger?.([{ isIntersecting: true }]);
    });
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });

  test('stays pending when the observer reports no intersection', () => {
    let trigger: ((entries: unknown[]) => void) | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    act(() => {
      trigger?.([{ isIntersecting: false }]);
    });
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'pending');
  });

  test('shows immediately when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    await act(() => Promise.resolve());
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });
});
