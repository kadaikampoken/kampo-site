/**
 * app/admin/page.tsx  （項目37：管理者ダッシュボード）
 */
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatDate, formatYen } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'ダッシュボード' };

export default async function AdminDashboardPage() {
  const now = new Date();

  const [
    newsTotal,
    newsDraft,
    eventTotal,
    eventUpcoming,
    projectActive,
    userTotal,
    adminTotal,
    attendanceTotal,
    timelineTotal,
    recentNews,
    nextEvents,
    recentUsers,
    fundSum,
    pendingDonations,
    confirmedDonations,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { published: false } }),
    prisma.event.count(),
    prisma.event.count({ where: { published: true, startsAt: { gte: now } } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.eventAttendance.count({ where: { status: 'ATTENDING' } }),
    prisma.timelineEntry.count(),
    prisma.news.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.event.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 5,
      include: { _count: { select: { attendances: { where: { status: 'ATTENDING' } } } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.project.aggregate({ _sum: { currentAmount: true } }),
    prisma.donation.count({ where: { status: 'REPORTED' } }),
    prisma.donation.count({ where: { status: 'CONFIRMED' } }),
  ]);

  const stats = [
    { label: '広報記事', value: `${newsTotal} 件`, sub: `下書き ${newsDraft} 件`, href: '/admin/news' },
    { label: 'イベント', value: `${eventTotal} 件`, sub: `開催予定 ${eventUpcoming} 件`, href: '/admin/events' },
    { label: '募集中のCF', value: `${projectActive} 件`, sub: `累計 ${formatYen(fundSum._sum.currentAmount ?? 0)}`, href: '/admin/crowdfunding' },
    { label: '登録ユーザー', value: `${userTotal} 名`, sub: `管理者 ${adminTotal} 名`, href: '/admin/users' },
    { label: '参加登録', value: `${attendanceTotal} 件`, sub: '参加ステータスのみ', href: '/admin/participants' },
    { label: '年表エントリ', value: `${timelineTotal} 件`, sub: '公開中の項目を含む', href: '/admin/history' },
    {
      label: '入金未確認の支援報告',
      value: `${pendingDonations} 件`,
      sub: `入金確認済み ${confirmedDonations} 件`,
      href: '/admin/donations?status=REPORTED',
    },
  ];

  return (
    <div>
      <PageHeader title="ダッシュボード" description="サイト全体の状況を確認できます。" />

      {/* 統計 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-kampo-800">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* 直近の記事 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-kampo-900">最近更新した広報</h2>
            <Link href="/admin/news" className="text-sm text-kampo-700 underline">
              すべて見る
            </Link>
          </div>
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {recentNews.length === 0 && (
              <li className="px-5 py-4 text-sm text-gray-500">記事がありません</li>
            )}
            {recentNews.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/news/${n.id}/edit`}
                    className="block truncate text-sm font-medium text-kampo-900 hover:underline"
                  >
                    {n.title}
                  </Link>
                  <p className="text-xs text-gray-500">更新 {formatDate(n.updatedAt)}</p>
                </div>
                <Badge tone={n.published ? 'green' : 'gray'}>
                  {n.published ? '公開' : '下書き'}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        {/* 直近のイベント */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-kampo-900">開催予定のイベント</h2>
            <Link href="/admin/events" className="text-sm text-kampo-700 underline">
              すべて見る
            </Link>
          </div>
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {nextEvents.length === 0 && (
              <li className="px-5 py-4 text-sm text-gray-500">予定されたイベントがありません</li>
            )}
            {nextEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/events/${e.id}/edit`}
                    className="block truncate text-sm font-medium text-kampo-900 hover:underline"
                  >
                    {e.title}
                  </Link>
                  <p className="text-xs text-gray-500">{formatDateTime(e.startsAt)}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-600">
                  {e._count.attendances}
                  {e.capacity !== null ? ` / ${e.capacity}` : ''} 名
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 新規ユーザー */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-kampo-900">最近登録したユーザー</h2>
            <Link href="/admin/users" className="text-sm text-kampo-700 underline">
              すべて見る
            </Link>
          </div>
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{formatDate(u.createdAt)}</span>
                  <Badge tone={u.role === 'ADMIN' ? 'green' : 'gray'}>
                    {u.role === 'ADMIN' ? '管理者' : '一般'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
