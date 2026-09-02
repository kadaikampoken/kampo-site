/**
 * app/members/[id]/page.tsx
 * 会員の詳細（ログインした会員のみ閲覧可）。
 *
 * 表示する項目：氏名・所属・自己紹介・登録日・権限・イベント参加履歴
 * メールアドレスは管理者にのみ表示する。
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { requireUser, isAdmin } from '@/lib/auth-guard';
import { Breadcrumbs } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ROLE_LABEL, ROLE_DESCRIPTION, ROLE_TONE, ATTENDANCE_LABEL } from '@/lib/constants';
import { formatDate, formatDateTime, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '会員情報',
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function MemberDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const viewer = await requireUser(`/members/${id}`);
  const viewerIsAdmin = isAdmin(viewer.role);
  const isSelf = viewer.id === id;

  const member = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      affiliation: true,
      bio: true,
      role: true,
      createdAt: true,
      // メールアドレスは管理者と本人にのみ渡す
      email: viewerIsAdmin || isSelf,
      attendances: {
        include: { event: { select: { id: true, title: true, startsAt: true, published: true } } },
        orderBy: { event: { startsAt: 'desc' } },
      },
      createdEvents: {
        where: { published: true },
        orderBy: { startsAt: 'desc' },
        take: 10,
        select: { id: true, title: true, startsAt: true },
      },
    },
  });

  if (!member) notFound();

  const now = new Date();
  // 非公開イベントへの参加履歴は一般会員には見せない
  const visibleAttendances = member.attendances.filter(
    (a) => a.event.published || viewerIsAdmin || isSelf
  );
  const upcoming = visibleAttendances.filter((a) => a.event.startsAt >= now);
  const past = visibleAttendances.filter((a) => a.event.startsAt < now);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[{ label: '会員一覧', href: '/members' }, { label: truncate(member.name, 20) }]}
      />

      {/* プロフィール */}
      <div className="rounded-lg border border-sand-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-kampo-900">
              {member.name}
              {isSelf && <span className="ml-2 text-sm font-normal text-kampo-700">(あなた)</span>}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{member.affiliation ?? '所属未設定'}</p>
          </div>
          <Badge tone={ROLE_TONE[member.role]}>{ROLE_LABEL[member.role]}</Badge>
        </div>

        {member.bio && (
          <div className="mt-6 border-t border-sand-200 pt-6">
            <h2 className="text-sm font-semibold text-kampo-900">自己紹介</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {member.bio}
            </p>
          </div>
        )}

        <dl className="mt-6 grid gap-4 border-t border-sand-200 pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">登録日</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatDate(member.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">参加したイベント</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{past.length} 件</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">権限</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-gray-600">
              {ROLE_DESCRIPTION[member.role]}
            </dd>
          </div>
        </dl>

        {/* メールアドレスは管理者と本人のみ */}
        {(viewerIsAdmin || isSelf) && member.email && (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-900">
              メールアドレス（{viewerIsAdmin && !isSelf ? '管理者のみ表示' : '本人のみ表示'}）
            </p>
            <p className="mt-1 break-all text-sm text-amber-900">{member.email}</p>
          </div>
        )}
      </div>

      {/* サポーターが作成したイベント */}
      {member.createdEvents.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-kampo-900">
            {member.name} さんが企画したイベント
          </h2>
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {member.createdEvents.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/events/${e.id}`}
                  className="text-sm font-medium text-kampo-900 hover:underline"
                >
                  {e.title}
                </Link>
                <span className="text-xs text-gray-500">{formatDate(e.startsAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 参加予定 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-kampo-900">参加予定のイベント</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="参加予定のイベントはありません" />
        ) : (
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/events/${a.event.id}`}
                    className="text-sm font-medium text-kampo-900 hover:underline"
                  >
                    {a.event.title}
                  </Link>
                  <p className="text-xs text-gray-500">{formatDateTime(a.event.startsAt)}</p>
                </div>
                <Badge tone={a.status === 'ATTENDING' ? 'green' : 'gray'}>
                  {ATTENDANCE_LABEL[a.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 参加履歴 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-kampo-900">参加履歴</h2>
        {past.length === 0 ? (
          <EmptyState title="参加履歴はまだありません" />
        ) : (
          <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
            {past.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/events/${a.event.id}`}
                    className="text-sm font-medium text-kampo-900 hover:underline"
                  >
                    {a.event.title}
                  </Link>
                  <p className="text-xs text-gray-500">{formatDate(a.event.startsAt)}</p>
                </div>
                <Badge tone={a.status === 'ATTENDING' ? 'default' : 'gray'}>
                  {ATTENDANCE_LABEL[a.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/members" variant="outline">
          会員一覧へ戻る
        </LinkButton>
        {isSelf && <LinkButton href="/mypage">プロフィールを編集</LinkButton>}
        {viewerIsAdmin && !isSelf && (
          <LinkButton href="/admin/users" variant="secondary">
            ユーザー管理で編集
          </LinkButton>
        )}
      </div>
    </div>
  );
}
