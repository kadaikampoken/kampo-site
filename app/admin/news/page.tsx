/**
 * app/admin/news/page.tsx  （項目38：広報管理）
 */
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { DeleteButton } from '@/components/admin/delete-button';
import { Flash } from '@/components/admin/flash';
import { deleteNewsAction, toggleNewsPublishedAction } from '@/app/actions/news';
import { formatDate, formatDateTime, truncate } from '@/lib/utils';
import { newsState, PUBLISH_STATE_LABEL, PUBLISH_STATE_TONE } from '@/lib/visibility';
import { ADMIN_PAGE_SIZE, NEWS_CATEGORY_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: '広報管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminNewsPage({ searchParams }: { searchParams: SearchParams }) {
  // 管理者専用ページ（サポーターはアクセス不可）
  await requireAdmin();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const now = new Date();

  const [total, items] = await Promise.all([
    prisma.news.count(),
    prisma.news.findMany({
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="広報管理"
        description={`全 ${total} 件の記事を管理できます。`}
        action={<LinkButton href="/admin/news/new">新規作成</LinkButton>}
      />

      <Flash params={sp} />

      {items.length === 0 ? (
        <EmptyState
          title="記事がまだありません"
          description="最初の記事を作成しましょう。"
          actionLabel="新規作成"
          actionHref="/admin/news/new"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">タイトル</th>
                  <th scope="col" className="px-4 py-3 font-medium">カテゴリ</th>
                  <th scope="col" className="px-4 py-3 font-medium">状態</th>
                  <th scope="col" className="px-4 py-3 font-medium">更新日</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {items.map((n) => (
                  <tr key={n.id} className="hover:bg-sand-50">
                    <td className="px-4 py-3">
                      <Link href={`/news/${n.id}`} className="font-medium text-kampo-900 hover:underline">
                        {truncate(n.title, 36)}
                      </Link>
                      <p className="text-xs text-gray-500">{n.author?.name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{NEWS_CATEGORY_LABEL[n.category]}</td>
                    <td className="px-4 py-3">
                      <form action={toggleNewsPublishedAction}>
                        <input type="hidden" name="id" value={n.id} />
                        <button type="submit" title="クリックで公開/下書きを切り替え">
                          <Badge tone={PUBLISH_STATE_TONE[newsState(n, now)]}>
                            {PUBLISH_STATE_LABEL[newsState(n, now)]}
                          </Badge>
                        </button>
                      </form>
                      {newsState(n, now) === 'SCHEDULED' && (
                        <p className="mt-1 text-xs text-amber-800">
                          {formatDateTime(n.publishedAt)} に公開
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {formatDate(n.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/news/${n.id}/edit`}
                        className="mr-4 text-sm font-medium text-kampo-700 hover:underline"
                      >
                        編集
                      </Link>
                      <DeleteButton
                        action={deleteNewsAction}
                        hiddenFields={{ id: n.id }}
                        confirmMessage={`「${n.title}」を削除します。よろしいですか？`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/news" />
        </>
      )}
    </div>
  );
}
