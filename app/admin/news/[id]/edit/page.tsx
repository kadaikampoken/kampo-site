/**
 * app/admin/news/[id]/edit/page.tsx
 */
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { NewsForm } from '@/components/admin/news-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { updateNewsAction, deleteNewsAction } from '@/app/actions/news';
import { formatDateTime, toDateTimeLocalValue, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: '広報の編集' };

type Params = Promise<{ id: string }>;

export default async function EditNewsPage({ params }: { params: Params }) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  // id を第1引数に束縛したサーバーアクション
  const action = updateNewsAction.bind(null, news.id);

  return (
    <div>
      <PageHeader
        title="広報の編集"
        description={`最終更新: ${formatDateTime(news.updatedAt)}`}
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: '広報管理', href: '/admin/news' },
          { label: truncate(news.title, 20) },
        ]}
      />

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <NewsForm
          action={action}
          submitLabel="変更を保存"
          defaultValues={{
            title: news.title,
            excerpt: news.excerpt,
            content: news.content,
            category: news.category,
            coverImage: news.coverImage ?? '',
            published: news.published,
            publishedAt: toDateTimeLocalValue(news.publishedAt),
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-bold text-red-900">この記事を削除</h2>
        <p className="mt-1 text-xs text-red-800">削除すると元に戻せません。</p>
        <div className="mt-3">
          <DeleteButton
            action={deleteNewsAction}
            hiddenFields={{ id: news.id }}
            label="記事を削除する"
            confirmMessage={`「${news.title}」を削除します。よろしいですか？`}
          />
        </div>
      </div>
    </div>
  );
}
