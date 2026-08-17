/**
 * app/admin/events/page.tsx  （項目40）
 */
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/delete-button';
import { Flash } from '@/components/admin/flash';
import { deleteEventAction } from '@/app/actions/events';
import { formatDateTime, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'イベント管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const now = new Date();

  const events = await prisma.event.findMany({
    orderBy: { startsAt: 'desc' },
    include: {
      _count: { select: { attendances: { where: { status: 'ATTENDING' } } } },
    },
  });

  return (
    <div>
      <PageHeader
        title="イベント管理"
        description={`全 ${events.length} 件。参加者の一覧は「参加者管理」から確認できます。`}
        action={<LinkButton href="/admin/events/new">新規作成</LinkButton>}
      />

      <Flash params={sp} />

      {events.length === 0 ? (
        <EmptyState
          title="イベントがまだありません"
          actionLabel="新規作成"
          actionHref="/admin/events/new"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">イベント名</th>
                <th scope="col" className="px-4 py-3 font-medium">開催日時</th>
                <th scope="col" className="px-4 py-3 font-medium">参加</th>
                <th scope="col" className="px-4 py-3 font-medium">状態</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-sand-50">
                  <td className="px-4 py-3">
                    <Link href={`/events/${e.id}`} className="font-medium text-kampo-900 hover:underline">
                      {truncate(e.title, 34)}
                    </Link>
                    <p className="text-xs text-gray-500">{truncate(e.location, 30)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                    {formatDateTime(e.startsAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/participants?eventId=${e.id}`}
                      className="text-sm text-kampo-700 hover:underline"
                    >
                      {e._count.attendances}
                      {e.capacity !== null ? ` / ${e.capacity}` : ''} 名
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge tone={e.published ? 'green' : 'gray'}>
                        {e.published ? '公開中' : '非公開'}
                      </Badge>
                      {e.startsAt < now && <Badge tone="gray">終了</Badge>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className="mr-4 text-sm font-medium text-kampo-700 hover:underline"
                    >
                      編集
                    </Link>
                    <DeleteButton
                      action={deleteEventAction}
                      hiddenFields={{ id: e.id }}
                      confirmMessage={`「${e.title}」を削除します。参加登録もすべて削除されます。よろしいですか？`}
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
