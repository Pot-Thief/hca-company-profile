import * as React from 'react';

import { cn } from '@/lib/utils';

function Button({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-edge border border-ink px-4 py-2 font-[family-name:var(--font-body)] text-[length:var(--text-small)] text-ink transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Button };
