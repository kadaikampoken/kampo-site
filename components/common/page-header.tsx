/**
 * components/common/page-header.tsx
 * 各ページ共通の見出し（パンくず付き）
 */
import Link from 'next/link';
import type { ReactNode } from 'react';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-kampo-700 hover:underline">
            ホーム
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-kampo-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kampo-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-kampo-300 to-transparent" />
    </header>
  );
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = 'すべて見る',
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-kampo-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-kampo-700 hover:text-kampo-900 hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
