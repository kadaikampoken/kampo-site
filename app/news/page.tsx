/**
 * app/news/page.tsx  （項目25：広報一覧）
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import type { NewsCategory, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { NewsCard } from '@/components/cards/news-card';
import { Pagination } from '@/components/ui/pagination';
import { NEWS_CATEGORY_LABEL, NEWS_CATEGORY_OPTIONS, PAGE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '広報・お知らせ',
  description: '鹿児島大学漢方医学研究会からのお知らせ・活動報告の一覧です。',
};

type SearchParams = Promise<{ page?: string; category?: string }>;

function isCategory(value: string | undefined): value is NewsCategory {
  return Boolean(value && value in NEWS_CATEGORY_LABEL);
}

export default async function NewsListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const category = isCategory(sp.category) ? sp.category : undefined;

  const where: Prisma.NewsWhereInput = {
    published: true,
    ...(category ? { category } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <PageHeader
        title="広報・お知らせ"
        description="活動報告、新歓情報、メディア掲載などをお知らせします。"
        breadcrumbs={[{ label: '広報' }]}
      />

      {/* カテゴリ絞り込み */}
      <nav aria-label="カテゴリ絞り込み" className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            !category
              ? 'border-kampo-700 bg-kampo-700 text-white'
              : 'border-sand-300 bg-white text-gray-700 hover:bg-kampo-50'
          )}
        >
          すべて
        </Link>
        {NEWS_CATEGORY_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/news?category=${opt.value}`}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              category === opt.value
                ? 'border-kampo-700 bg-kampo-700 text-white'
                : 'border-sand-300 bg-white text-gray-700 hover:bg-kampo-50'
            )}
          >
            {opt.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          title="該当する記事がありません"
          description={
            category
              ? '別のカテゴリを選択してみてください。'
              : '記事が公開されるとこちらに表示されます。'
          }
          actionLabel="すべての記事を見る"
          actionHref="/news"
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">全 {total} 件</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/news"
            searchParams={{ category }}
          />
        </>
      )}
    </div>
  );
}
