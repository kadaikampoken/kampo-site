/**
 * components/common/loading.tsx  （項目21：Loading）
 */
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-6 w-6 animate-spin text-kampo-600', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/** ページ全体のローディング表示 */
export function Loading({ label = '読み込み中…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

/** カード一覧のスケルトン */
export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-sand-200 bg-white p-5">
          <div className="mb-3 h-4 w-20 rounded bg-sand-200" />
          <div className="mb-2 h-5 w-4/5 rounded bg-sand-200" />
          <div className="mb-2 h-4 w-full rounded bg-sand-100" />
          <div className="h-4 w-2/3 rounded bg-sand-100" />
        </div>
      ))}
    </div>
  );
}

/** 表のスケルトン */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded bg-sand-100" />
      ))}
    </div>
  );
}
