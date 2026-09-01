/**
 * app/events/[id]/page.tsx  （項目30：イベント詳細 ＋ 項目31：参加/不参加）
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
import { Alert } from '@/components/ui/alert';
import { AttendanceForm } from '@/components/attendance-form';
import { formatDateTime, formatDate, truncate } from '@/lib/utils';
import { isEventVisible, eventState } from '@/lib/visibility';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, summary: true, published: true, publishAt: true },
  });
  if (!event || !isEventVisible(event)) return { title: 'イベントが見つかりません' };
  return { title: event.title, description: truncate(event.summary, 120) };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { attendances: { where: { status: 'ATTENDING' } } } },
    },
  });

  // 非公開・予約公開のイベントは管理者のみ閲覧可
  const nowForState = new Date();
  if (!event) notFound();
  const state = eventState(event, nowForState);
  if (state !== 'PUBLISHED' && !isAdmin) notFound();

  const attendingCount = event._count.attendances;

  // ログイン中のユーザー自身の登録状況（未ログインなら null）
  const mine = user
    ? await prisma.eventAttendance.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: user.id } },
        select: { status: true, note: true },
      })
    : null;

  const now = new Date();
  const isPast = event.startsAt < now;
  const isClosed = Boolean(event.deadline && event.deadline < now);
  const isFull =
    event.capacity !== null && attendingCount >= event.capacity && mine?.status !== 'ATTENDING';

  let disabledReason: string | undefined;
  if (isPast) disabledReason = 'このイベントは終了しました。';
  else if (isClosed) disabledReason = '申込期限を過ぎました。';
  else if (isFull) disabledReason = '定員に達したため受付を終了しました。';

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[{ label: 'イベント', href: '/events' }, { label: truncate(event.title, 24) }]}
      />

      {state === 'DRAFT' && (
        <Alert tone="warning" className="mb-6">
          このイベントは<strong>非公開</strong>です。管理者のみ閲覧できます。
        </Alert>
      )}
      {state === 'SCHEDULED' && (
        <Alert tone="warning" className="mb-6">
          このイベントは<strong>予約公開</strong>です。
          {formatDate(event.publishAt)}以降に自動で一般公開されます。
        </Alert>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <article>
          <div className="mb-4 flex flex-wrap gap-2">
            {isPast ? <Badge tone="gray">終了</Badge> : <Badge tone="green">受付中</Badge>}
            {mine?.status === 'ATTENDING' && <Badge tone="blue">参加登録済み</Badge>}
            {mine?.status === 'NOT_ATTENDING' && <Badge tone="gray">不参加で登録済み</Badge>}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-kampo-900 sm:text-3xl">
            {event.title}
          </h1>
          <p className="mt-4 rounded-md bg-sand-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {event.summary}
          </p>

          <dl className="mt-8 divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white text-sm">
            <div className="flex gap-4 px-5 py-3">
              <dt className="w-24 shrink-0 font-medium text-gray-500">日時</dt>
              <dd className="text-gray-800">
                <time dateTime={event.startsAt.toISOString()}>{formatDateTime(event.startsAt)}</time>
                {event.endsAt && <> 〜 {formatDateTime(event.endsAt).split(' ')[1]}</>}
              </dd>
            </div>
            <div className="flex gap-4 px-5 py-3">
              <dt className="w-24 shrink-0 font-medium text-gray-500">場所</dt>
              <dd className="text-gray-800">{event.location}</dd>
            </div>
            <div className="flex gap-4 px-5 py-3">
              <dt className="w-24 shrink-0 font-medium text-gray-500">定員</dt>
              <dd className="text-gray-800">
                {event.capacity === null ? '定員なし' : `${event.capacity} 名`}
                <span className="ml-2 text-gray-500">（現在 {attendingCount} 名が参加予定）</span>
              </dd>
            </div>
            {event.deadline && (
              <div className="flex gap-4 px-5 py-3">
                <dt className="w-24 shrink-0 font-medium text-gray-500">申込締切</dt>
                <dd className="text-gray-800">{formatDateTime(event.deadline)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-kampo-900">開催内容</h2>
            <ArticleBody text={event.description} />
          </div>
        </article>

        {/* 参加登録エリア */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {user ? (
            <AttendanceForm
              eventId={event.id}
              currentStatus={mine?.status ?? null}
              currentNote={mine?.note ?? null}
              disabled={Boolean(disabledReason)}
              disabledReason={disabledReason}
            />
          ) : (
            <div className="rounded-lg border border-sand-200 bg-white p-6">
              <h2 className="text-base font-bold text-kampo-900">参加登録</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                参加・不参加の登録にはログインが必要です。
                会員登録は無料で、どなたでも登録いただけます。
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <LinkButton href={`/login?callbackUrl=/events/${event.id}`}>ログイン</LinkButton>
                <LinkButton href="/register" variant="outline">
                  新規会員登録
                </LinkButton>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <LinkButton href="/events" variant="outline">
              イベント一覧へ戻る
            </LinkButton>
            {isAdmin && (
              <>
                <LinkButton href={`/admin/events/${event.id}/edit`} variant="secondary">
                  このイベントを編集
                </LinkButton>
                <Link
                  href={`/admin/participants?eventId=${event.id}`}
                  className="text-center text-sm text-kampo-700 underline hover:text-kampo-900"
                >
                  参加者一覧を見る
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
