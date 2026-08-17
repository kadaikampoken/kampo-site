/**
 * app/news/[id]/page.tsx  （項目26：広報詳細）
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/page-header';
import { ArticleBody } from '@/components/common/article-body';
import { LinkButton } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import { NEWS_CATEGORY_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

async function getNews(id: string, isAdmin: boolean) {
  return prisma.news.findFirst({
    where: { id, ...(isAdmin ? {} : { published: true }) },
    include: { author: { select: { name: true } } },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    select: { title: true, excerpt: true, published: true },
  });
  if (!news || !news.published) return { title: '記事が見つかりません' };
  return {
    title: news.title,
    description: truncate(news.excerpt, 120),
  };
}

export default async function NewsDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const news = await getNews(id, isAdmin);
  if (!news) notFound();

  // 前後の記事
  const publishedAt = news.publishedAt ?? news.createdAt;
  const [prev, next] = await Promise.all([
    prisma.news.findFirst({
      where: { published: true, publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true },
    }),
    prisma.news.findFirst({
      where: { published: true, publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: '広報', href: '/news' }, { label: truncate(news.title, 24) }]} />

      {!news.published && (
        <p className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          この記事は<strong>下書き</strong>です。管理者のみ閲覧できます。
        </p>
      )}

      <article>
        <header className="mb-8 border-b border-sand-200 pb-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge>{NEWS_CATEGORY_LABEL[news.category]}</Badge>
            <time dateTime={publishedAt.toISOString()} className="text-sm text-gray-500">
              {formatDate(publishedAt)}
            </time>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-kampo-900 sm:text-3xl">
            {news.title}
          </h1>
          <p className="mt-4 rounded-md bg-sand-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {news.excerpt}
          </p>
          {news.author && (
            <p className="mt-4 text-sm text-gray-500">投稿者：{news.author.name}</p>
          )}
        </header>

        <ArticleBody text={news.content} />
      </article>

      {/* 前後の記事 */}
      <nav aria-label="記事の移動" className="mt-14 grid gap-3 border-t border-sand-200 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/news/${prev.id}`}
            className="rounded-lg border border-sand-200 bg-white p-4 hover:border-kampo-300"
          >
            <span className="text-xs text-gray-500">前の記事</span>
            <span className="mt-1 block text-sm font-medium text-kampo-900">{truncate(prev.title, 40)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/news/${next.id}`}
            className="rounded-lg border border-sand-200 bg-white p-4 text-right hover:border-kampo-300 sm:col-start-2"
          >
            <span className="text-xs text-gray-500">次の記事</span>
            <span className="mt-1 block text-sm font-medium text-kampo-900">{truncate(next.title, 40)}</span>
          </Link>
        )}
      </nav>

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/news" variant="outline">
          広報一覧へ戻る
        </LinkButton>
        {isAdmin && (
          <LinkButton href={`/admin/news/${news.id}/edit`} variant="secondary">
            この記事を編集
          </LinkButton>
        )}
      </div>
    </div>
  );
}
