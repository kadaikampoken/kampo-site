/**
 * components/ui/progress-bar.tsx
 * クラウドファンディングの達成率表示
 */
import { cn } from '@/lib/utils';

export function ProgressBar({ rate, className }: { rate: number; className?: string }) {
  const width = Math.min(100, Math.max(0, rate));
  return (
    <div
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-sand-200', className)}
      role="progressbar"
      aria-valuenow={rate}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="達成率"
    >
      <div
        className={cn('h-full rounded-full', rate >= 100 ? 'bg-sand-500' : 'bg-kampo-600')}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
