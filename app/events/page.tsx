/**
 * app/events/page.tsx  （項目29：イベント一覧）
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import type { AttendanceStatus, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { EventCard } from '@/components/cards/event-card';
import { Pagination } from '@/components/ui/pagination';
import { PAGE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { visibleEventWhere } from '@/lib/visibility';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'イベント',
  description: '定例勉強会、生薬見学会、新歓イベントなどの開催予定と過去の実施記録です。',
};

type SearchParams = Promise<{ page?: string; filter?: string }>;

export default async function EventListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const filter = sp.filter === 'past' ? 'past' : 'upcoming';
  const now = new Date();

  const where: Prisma.EventWhereInput = {
    ...visibleEventWhere(now),
    startsAt: filter === 'past' ? { lt: now } : { gte: now },
  };

  const session = await auth();
  const userId = session?.user?.id;

  const [total, events, myAttendances] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startsAt: filter === 'past' ? 'desc' : 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { attendances: { where: { status: 'ATTENDING' } } } } },
    }),
    userId
      ? prisma.eventAttendance.findMany({
          where: { userId },
          select: { eventId: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const statusMap = new Map<string, AttendanceStatus>(
    myAttendances.map((a) => [a.eventId, a.status as AttendanceStatus])
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs = [
    { key: 'upcoming', label: '開催予定', href: '/events' },
    { key: 'past', label: '過去のイベント', href: '/events?filter=past' },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <PageHeader
        title="イベント"
        description="勉強会・見学会・新歓イベントの開催情報です。参加登録は詳細ページから行えます。"
        breadcrumbs={[{ label: 'イベント' }]}
      />

      <nav aria-label="イベント絞り込み" className="mb-8 flex gap-2 border-b border-sand-200">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors',
              filter === tab.key
                ? 'border-kampo-600 font-semibold text-kampo-800'
                : 'border-transparent text-gray-600 hover:text-kampo-700'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {!session && (
        <p className="mb-6 rounded-md border border-sand-200 bg-white px-4 py-3 text-sm text-gray-600">
          イベントへの参加登録には
          <Link href="/login?callbackUrl=/events" className="mx-1 font-medium text-kampo-700 underline">
            ログイン
          </Link>
          が必要です。
        </p>
      )}

      {events.length === 0 ? (
        <EmptyState
          title={filter === 'past' ? '過去のイベントはまだありません' : '開催予定のイベントはありません'}
          description={
            filter === 'past'
              ? '実施したイベントはこちらに記録されます。'
              : '次回の開催が決まり次第お知らせします。'
          }
          actionLabel={filter === 'past' ? '開催予定を見る' : '過去のイベントを見る'}
          actionHref={filter === 'past' ? '/events' : '/events?filter=past'}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">全 {total} 件</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                attendingCount={e._count.attendances}
                myStatus={statusMap.get(e.id) ?? null}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/events"
            searchParams={{ filter: sp.filter }}
          />
        </>
      )}
    </div>
  );
}
