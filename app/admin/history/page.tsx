/**
 * app/admin/history/page.tsx  （項目41：年表管理）
 */
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/delete-button';
import { Flash } from '@/components/admin/flash';
import { deleteTimelineAction } from '@/app/actions/timeline';
import { truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: '年表管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const entries = await prisma.timelineEntry.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return (
    <div>
      <PageHeader
        title="年表管理"
        description={`全 ${entries.length} 件。年・月の順に自動で並び替えられます。`}
        action={<LinkButton href="/admin/history/new">新規作成</LinkButton>}
      />

      <Flash params={sp} />

      {entries.length === 0 ? (
        <EmptyState
          title="年表エントリがまだありません"
          actionLabel="新規作成"
          actionHref="/admin/history/new"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">年月</th>
                <th scope="col" className="px-4 py-3 font-medium">タイトル</th>
                <th scope="col" className="px-4 py-3 font-medium">状態</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-sand-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-sand-700">
                    {e.year}年{e.month ? `${e.month}月` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/history/${e.id}`} className="font-medium text-kampo-900 hover:underline">
                      {truncate(e.title, 32)}
                    </Link>
                    <p className="text-xs text-gray-500">{truncate(e.summary, 40)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={e.published ? 'green' : 'gray'}>
                      {e.published ? '公開中' : '非公開'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/history/${e.id}/edit`}
                      className="mr-4 text-sm font-medium text-kampo-700 hover:underline"
                    >
                      編集
                    </Link>
                    <DeleteButton
                      action={deleteTimelineAction}
                      hiddenFields={{ id: e.id }}
                      confirmMessage={`「${e.title}」を削除します。よろしいですか？`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
