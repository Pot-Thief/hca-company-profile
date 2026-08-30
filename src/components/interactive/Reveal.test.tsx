import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Reveal } from './Reveal';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// jsdom gives every element a zero-sized rect, so without this every block
// counts as already on screen and the observer path is never reached.
function placeBelowTheFold() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 5000,
  } as DOMRect);
}

function stubObserver() {
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
  return () => trigger;
}

describe('Reveal', () => {
  test('renders its children', () => {
    render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(screen.getByText('CHILD_X')).toBeInTheDocument();
  });

  // The server and the first client render must agree, or React reports a
  // hydration mismatch. Starting hidden is what caused one.
  test('renders shown, so the server and client markup agree', () => {
    stubObserver();
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });

  test('stays shown when it is already on screen', () => {
    stubObserver();
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });

  test('hides itself once it knows it is below the fold', () => {
    placeBelowTheFold();
    stubObserver();
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'pending');
  });

  test('shows again when the observer reports an intersection', () => {
    placeBelowTheFold();
    const getTrigger = stubObserver();
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    act(() => {
      getTrigger()?.([{ isIntersecting: true }]);
    });
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });

  test('stays pending while the observer reports no intersection', () => {
    placeBelowTheFold();
    const getTrigger = stubObserver();
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    act(() => {
      getTrigger()?.([{ isIntersecting: false }]);
    });
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'pending');
  });

  // The failure that started all of this: when the client code never runs, the
  // content has to be readable anyway.
  test('never hides anything when IntersectionObserver is unavailable', () => {
    placeBelowTheFold();
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <Reveal>
        <p>CHILD_X</p>
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'shown');
  });
});
