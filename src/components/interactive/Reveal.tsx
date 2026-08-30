'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Renders visible and only hides itself once it knows it is off screen.
//
// This used to render hidden and wait for JavaScript to show it, with the
// hidden state living in `@media (scripting: enabled)`. That media query means
// the browser permits scripts, not that ours arrived, so a failed bundle left
// six of the page's eight blocks invisible with nothing able to reveal them.
// The fix after that was worse: an inline script stamped an attribute onto
// <html> before hydration, which React compares against its own tree and
// reported as a hydration mismatch — and a failed root hydration takes every
// client component with it, so the menu and the disclosures stopped opening.
//
// Nothing outside React touches the document now. The server and the first
// client render both say `shown`, so there is nothing to mismatch. Hiding
// happens after mount and only for blocks already below the fold, where it
// cannot be seen happening. If this effect never runs, every block simply
// stays visible.
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const element = ref.current!;
    // Already on screen: leave it alone. Hiding it now to fade it back in is
    // the flash this whole arrangement exists to avoid.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setShown(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={shown ? 'shown' : 'pending'}>
      {children}
    </div>
  );
}
