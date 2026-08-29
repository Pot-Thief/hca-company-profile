'use client';

import { useEffect, useRef, useState } from 'react';

export function CopyButton({
  value,
  label,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  label: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write was denied or unavailable; the button stays usable.
    }
  }

  return (
    <span className="inline-flex items-center gap-[var(--space-block)]">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${copyLabel} ${label}`}
        className="font-mono text-label uppercase tracking-label text-on-surface-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface"
      >
        {copyLabel}
      </button>
      <span
        aria-live="polite"
        className="block h-[1em] leading-none font-mono text-label uppercase tracking-label text-on-surface-muted"
      >
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}
