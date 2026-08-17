/**
 * components/ui/pagination.tsx
 * サーバーコンポーネントから使えるページネーション（リンク方式）
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  const itemClass = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm';

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="ページ送り">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className={cn(itemClass, 'border border-sand-300 bg-white hover:bg-kampo-50')}>
          前へ
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          className={cn(
            itemClass,
            p === currentPage
              ? 'bg-kampo-700 font-semibold text-white'
              : 'border border-sand-300 bg-white hover:bg-kampo-50'
          )}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className={cn(itemClass, 'border border-sand-300 bg-white hover:bg-kampo-50')}>
          次へ
        </Link>
      )}
    </nav>
  );
}
