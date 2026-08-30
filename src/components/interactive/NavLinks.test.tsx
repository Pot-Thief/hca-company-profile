import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { NavLinks } from './NavLinks';

const nav = [
  { label: 'ABOUT_X', href: '#about' },
  { label: 'SERVICES_X', href: '#services' },
];

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('NavLinks', () => {
  test('renders one link per item', () => {
    render(<NavLinks nav={nav} />);
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).toHaveAttribute('href', '#about');
  });

  test('no link is current before any section is observed', () => {
    render(<NavLinks nav={nav} />);
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
  });

  test('marks the link whose section is intersecting', () => {
    document.body.innerHTML = '<section id="about"></section><section id="services"></section>';
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
    render(<NavLinks nav={nav} />);
    act(() => {
      trigger?.([
        {
          isIntersecting: true,
          target: document.getElementById('services'),
          boundingClientRect: { top: 10 },
        },
      ]);
    });
    expect(screen.getByRole('link', { name: 'SERVICES_X' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
  });

  test('picks the entry closest to the top edge when multiple sections intersect', () => {
    document.body.innerHTML = '<section id="about"></section><section id="services"></section>';
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
    render(<NavLinks nav={nav} />);
    act(() => {
      trigger?.([
        {
          isIntersecting: true,
          target: document.getElementById('services'),
          boundingClientRect: { top: 50 },
        },
        {
          isIntersecting: true,
          target: document.getElementById('about'),
          boundingClientRect: { top: 5 },
        },
      ]);
    });
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('link', { name: 'SERVICES_X' })).not.toHaveAttribute('aria-current');
  });

  test('does nothing when IntersectionObserver is unavailable', () => {
    document.body.innerHTML = '<section id="about"></section><section id="services"></section>';
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<NavLinks nav={nav} />);
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
  });

  test('leaves the current link unset when no section is intersecting', () => {
    document.body.innerHTML = '<section id="about"></section><section id="services"></section>';
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
    render(<NavLinks nav={nav} />);
    act(() => {
      trigger?.([
        {
          isIntersecting: false,
          target: document.getElementById('about'),
          boundingClientRect: { top: 5 },
        },
      ]);
    });
    expect(screen.getByRole('link', { name: 'ABOUT_X' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'SERVICES_X' })).not.toHaveAttribute('aria-current');
  });

  test('does nothing when none of the nav hrefs resolve to an element', () => {
    let constructed = false;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor() {
          constructed = true;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<NavLinks nav={nav} />);
    expect(constructed).toBe(false);
  });
});
