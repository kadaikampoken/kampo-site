/**
 * app/history/[id]/page.tsx  （項目33：年表詳細）
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Breadcrumbs } from '@/components/common/page-header';
import { ArticleBody } from '@/components/common/article-body';
import { LinkButton } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const entry = await prisma.timelineEntry.findUnique({
    where: { id },
    select: { title: true, summary: true, year: true, published: true },
  });
  if (!entry || !entry.published) return { title: '年表が見つかりません' };
  return { title: `${entry.year}年 ${entry.title}`, description: truncate(entry.summary, 120) };
}

export default async function HistoryDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const entry = await prisma.timelineEntry.findUnique({ where: { id } });
  if (!entry || (!entry.published && !isAdmin)) notFound();

  const [older, newer] = await Promise.all([
    prisma.timelineEntry.findFirst({
      where: { published: true, year: { lt: entry.year } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: { id: true, title: true, year: true },
    }),
    prisma.timelineEntry.findFirst({
      where: { published: true, year: { gt: entry.year } },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      select: { id: true, title: true, year: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[{ label: '年表', href: '/history' }, { label: `${entry.year}年 ${truncate(entry.title, 20)}` }]}
      />

      {!entry.published && (
        <Alert tone="warning" className="mb-6">
          この年表エントリは<strong>非公開</strong>です。管理者のみ閲覧できます。
        </Alert>
      )}

      <article>
        <header className="mb-8 border-b border-sand-200 pb-6">
          <p className="text-sm font-semibold text-sand-700">
            {entry.year}年{entry.month ? `${entry.month}月` : ''}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-kampo-900 sm:text-3xl">
            {entry.title}
          </h1>
          <p className="mt-4 rounded-md bg-sand-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {entry.summary}
          </p>
        </header>

        <ArticleBody text={entry.body} />
      </article>

      <nav aria-label="年表の移動" className="mt-14 grid gap-3 border-t border-sand-200 pt-8 sm:grid-cols-2">
        {older ? (
          <Link
            href={`/history/${older.id}`}
            className="rounded-lg border border-sand-200 bg-white p-4 hover:border-kampo-300"
          >
            <span className="text-xs text-gray-500">← より前のできごと（{older.year}年）</span>
            <span className="mt-1 block text-sm font-medium text-kampo-900">
              {truncate(older.title, 40)}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            href={`/history/${newer.id}`}
            className="rounded-lg border border-sand-200 bg-white p-4 text-right hover:border-kampo-300 sm:col-start-2"
          >
            <span className="text-xs text-gray-500">より後のできごと（{newer.year}年）→</span>
            <span className="mt-1 block text-sm font-medium text-kampo-900">
              {truncate(newer.title, 40)}
            </span>
          </Link>
        )}
      </nav>

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/history" variant="outline">
          年表へ戻る
        </LinkButton>
        {isAdmin && (
          <LinkButton href={`/admin/history/${entry.id}/edit`} variant="secondary">
            この項目を編集
          </LinkButton>
        )}
      </div>
    </div>
  );
}
