'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Tells the inline script in layout.tsx that hydration actually happened,
    // so its safety timer stands down. Without a signal from real React code
    // the page cannot tell "scripts allowed" from "our bundle ran".
    document.documentElement.dataset.hydrated = 'true';

    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setShown(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={shown ? 'shown' : 'pending'}>
      {children}
    </div>
  );
}
