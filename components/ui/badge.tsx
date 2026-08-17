/**
 * components/ui/badge.tsx
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'green' | 'sand' | 'blue' | 'red' | 'gray' | 'amber';

const tones: Record<Tone, string> = {
  default: 'bg-kampo-100 text-kampo-800',
  green: 'bg-kampo-700 text-white',
  sand: 'bg-sand-200 text-sand-900',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-800',
};

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
