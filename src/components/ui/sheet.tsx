'use client';

import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay className={cn('fixed inset-0 z-40 bg-void/10', className)} {...props} />
  );
}

function SheetContent({
  className,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { closeLabel: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-3/4 max-w-sm flex-col gap-4 border-l border-rule bg-surface p-6',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close asChild>
          <Button aria-label={closeLabel} className="absolute top-3 right-3 h-8 w-8 p-0">
            <XIcon />
          </Button>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetContent };
