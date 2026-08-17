/**
 * components/ui/alert.tsx
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'error' | 'info' | 'warning';

const tones: Record<Tone, string> = {
  success: 'border-kampo-300 bg-kampo-50 text-kampo-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
};

export function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-4 py-3 text-sm', tones[tone], className)}
    >
      {children}
    </div>
  );
}
