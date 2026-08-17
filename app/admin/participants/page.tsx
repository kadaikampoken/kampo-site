/**
 * app/admin/participants/page.tsx  （項目43：参加者管理）
 */
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { DeleteButton } from '@/components/admin/delete-button';
import { adminRemoveAttendanceAction } from '@/app/actions/events';
import { formatDateTime, formatDate } from '@/lib/utils';
import { ATTENDANCE_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: '参加者管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const eventId = sp.eventId;
  const status = sp.status === 'NOT_ATTENDING' ? 'NOT_ATTENDING' : sp.status === 'ATTENDING' ? 'ATTENDING' : undefined;

  const where: Prisma.EventAttendanceWhereInput = {
    ...(eventId ? { eventId } : {}),
    ...(status ? { status } : {}),
  };

  const [events, attendances, selectedEvent] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
      select: {
        id: true,
        title: true,
        startsAt: true,
        capacity: true,
        _count: { select: { attendances: { where: { status: 'ATTENDING' } } } },
      },
    }),
    prisma.eventAttendance.findMany({
      where,
      orderBy: [{ event: { startsAt: 'desc' } }, { createdAt: 'asc' }],
      include: {
        user: { select: { id: true, name: true, email: true, affiliation: true } },
        event: { select: { id: true, title: true, startsAt: true } },
      },
      take: 300,
    }),
    eventId
      ? prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, title: true, startsAt: true, capacity: true },
        })
      : Promise.resolve(null),
  ]);

  const attendingCount = attendances.filter((a) => a.status === 'ATTENDING').length;
  const notAttendingCount = attendances.length - attendingCount;

  const buildHref = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { eventId, status: sp.status, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/admin/participants?${qs}` : '/admin/participants';
  };

  return (
    <div>
      <PageHeader
        title="参加者管理"
        description="イベントごとの参加・不参加の登録状況を確認できます。"
        action={
          <a
            href={`/api/admin/participants/export${eventId ? `?eventId=${eventId}` : ''}`}
            className="inline-flex h-10 items-center rounded-md border border-kampo-300 bg-white px-4 text-sm font-medium text-kampo-800 hover:bg-kampo-50"
          >
            CSVでダウンロード
          </a>
        }
      />

      {/* イベント絞り込み */}
      <form action="/admin/participants" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="eventId" className="mb-1 block text-xs font-medium text-gray-600">
            イベント
          </label>
          <select
            id="eventId"
            name="eventId"
            defaultValue={eventId ?? ''}
            className="w-full min-w-[18rem] rounded-md border border-sand-300 px-3 py-2 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
          >
            <option value="">すべてのイベント</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {formatDate(e.startsAt)}｜{e.title}（{e._count.attendances}名）
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-md bg-kampo-700 px-4 text-sm font-medium text-white hover:bg-kampo-800"
        >
          絞り込む
        </button>
        {(eventId || status) && (
          <Link href="/admin/participants" className="text-sm text-gray-600 underline">
            条件をクリア
          </Link>
        )}
      </form>

      {/* ステータス絞り込み */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: undefined, label: `すべて（${attendances.length}）` },
          { key: 'ATTENDING', label: `参加（${attendingCount}）` },
          { key: 'NOT_ATTENDING', label: `不参加（${notAttendingCount}）` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={buildHref({ status: tab.key })}
            className={
              sp.status === tab.key || (!sp.status && !tab.key)
                ? 'rounded-full bg-kampo-700 px-4 py-1.5 text-sm text-white'
                : 'rounded-full border border-sand-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-kampo-50'
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {selectedEvent && (
        <div className="mb-6 rounded-lg border border-kampo-200 bg-kampo-50 p-4">
          <p className="text-sm font-semibold text-kampo-900">{selectedEvent.title}</p>
          <p className="mt-1 text-xs text-gray-600">
            {formatDateTime(selectedEvent.startsAt)}
            {selectedEvent.capacity !== null && `／定員 ${selectedEvent.capacity} 名`}
          </p>
          <Link
            href={`/events/${selectedEvent.id}`}
            className="mt-2 inline-block text-xs text-kampo-700 underline"
          >
            イベントページを表示
          </Link>
        </div>
      )}

      {attendances.length === 0 ? (
        <EmptyState
          title="参加登録がありません"
          description="会員がイベントページから参加登録すると、こちらに表示されます。"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">参加者</th>
                {!eventId && <th scope="col" className="px-4 py-3 font-medium">イベント</th>}
                <th scope="col" className="px-4 py-3 font-medium">状況</th>
                <th scope="col" className="px-4 py-3 font-medium">連絡事項</th>
                <th scope="col" className="px-4 py-3 font-medium">登録日</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {attendances.map((a) => (
                <tr key={a.id} className="hover:bg-sand-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.user.name}</p>
                    <p className="break-all text-xs text-gray-500">{a.user.email}</p>
                    {a.user.affiliation && (
                      <p className="text-xs text-gray-400">{a.user.affiliation}</p>
                    )}
                  </td>
                  {!eventId && (
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/participants?eventId=${a.event.id}`}
                        className="text-sm text-kampo-800 hover:underline"
                      >
                        {a.event.title}
                      </Link>
                      <p className="text-xs text-gray-500">{formatDate(a.event.startsAt)}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Badge tone={a.status === 'ATTENDING' ? 'green' : 'gray'}>
                      {ATTENDANCE_LABEL[a.status]}
                    </Badge>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 text-xs text-gray-600">
                    {a.note ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <DeleteButton
                      action={adminRemoveAttendanceAction}
                      hiddenFields={{ id: a.id }}
                      label="登録を削除"
                      confirmMessage={`${a.user.name} さんの登録を削除します。よろしいですか？`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        ※ 表示は最新300件までです。全件が必要な場合はCSVをご利用ください。
      </p>
    </div>
  );
}
