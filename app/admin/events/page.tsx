/**
 * app/admin/events/page.tsx  （項目40：イベント管理）
 * 管理者はすべてのイベント、サポーターは自分が作成したイベントのみを表示する。
 */
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireStaff, isAdmin, canEditEvent } from '@/lib/auth-guard';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/admin/delete-button';
import { Flash } from '@/components/admin/flash';
import { deleteEventAction } from '@/app/actions/events';
import { eventState, PUBLISH_STATE_LABEL, PUBLISH_STATE_TONE } from '@/lib/visibility';
import { formatDateTime, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'イベント管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireStaff('/admin/events');
  const sp = await searchParams;
  const now = new Date();
  const admin = isAdmin(user.role);

  // サポーターは自分が作成したイベントだけを扱う
  const where: Prisma.EventWhereInput = admin ? {} : { createdById: user.id };

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: 'desc' },
    include: {
      _count: { select: { attendances: { where: { status: 'ATTENDING' } } } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="イベント管理"
        description={
          admin
            ? `全 ${events.length} 件。参加者の一覧は「参加者管理」から確認できます。`
            : `あなたが作成したイベント ${events.length} 件です。他の方が作成したイベントは表示されません。`
        }
        action={<LinkButton href="/admin/events/new">新規作成</LinkButton>}
      />

      <Flash params={sp} />

      {!admin && (
        <p className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          サポーター権限では、<strong>ご自身が作成したイベントのみ</strong>編集・削除できます。
          参加者の一覧や他の管理機能は管理者にお問い合わせください。
        </p>
      )}

      {events.length === 0 ? (
        <EmptyState
          title={admin ? 'イベントがまだありません' : '作成したイベントはまだありません'}
          description="「新規作成」から追加できます。"
          actionLabel="新規作成"
          actionHref="/admin/events/new"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">イベント名</th>
                <th scope="col" className="px-4 py-3 font-medium">開催日時</th>
                {admin && <th scope="col" className="px-4 py-3 font-medium">作成者</th>}
                <th scope="col" className="px-4 py-3 font-medium">参加</th>
                <th scope="col" className="px-4 py-3 font-medium">状態</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {events.map((e) => {
                const editable = canEditEvent(user, e);
                return (
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
                    {admin && (
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                        {e.createdBy?.name ?? '—'}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3">
                      {admin ? (
                        <Link
                          href={`/admin/participants?eventId=${e.id}`}
                          className="text-sm text-kampo-700 hover:underline"
                        >
                          {e._count.attendances}
                          {e.capacity !== null ? ` / ${e.capacity}` : ''} 名
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-700">
                          {e._count.attendances}
                          {e.capacity !== null ? ` / ${e.capacity}` : ''} 名
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge tone={PUBLISH_STATE_TONE[eventState(e, now)]}>
                          {eventState(e, now) === 'DRAFT'
                            ? '非公開'
                            : PUBLISH_STATE_LABEL[eventState(e, now)]}
                        </Badge>
                        {eventState(e, now) === 'SCHEDULED' && (
                          <span className="text-xs text-amber-800">
                            {formatDateTime(e.publishAt)} に公開
                          </span>
                        )}
                        {e.startsAt < now && <Badge tone="gray">終了</Badge>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editable ? (
                        <>
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
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">権限なし</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
