/**
 * app/mypage/page.tsx  （項目36：マイページ）
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-guard';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';
import { ProfileForm, PasswordForm } from '@/components/forms/profile-form';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ROLE_LABEL, ROLE_TONE, ROLE_DESCRIPTION, ATTENDANCE_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'マイページ',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ welcome?: string; error?: string }>;

export default async function MyPage({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await requireUser('/mypage');
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      attendances: {
        include: { event: true },
        orderBy: { event: { startsAt: 'asc' } },
      },
    },
  });

  if (!user) notFound();

  const now = new Date();
  const upcoming = user.attendances.filter((a) => a.event.startsAt >= now);
  const past = user.attendances.filter((a) => a.event.startsAt < now);

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <PageHeader
        title="マイページ"
        description={`${user.name} さんの登録情報と参加予定です。`}
        breadcrumbs={[{ label: 'マイページ' }]}
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/members" variant="outline">
              会員一覧
            </LinkButton>
            {(user.role === 'ADMIN' || user.role === 'SUPPORTER') && (
              <LinkButton href="/admin" variant="secondary">
                管理画面へ
              </LinkButton>
            )}
          </div>
        }
      />

      {sp.welcome && (
        <Alert tone="success" className="mb-6">
          会員登録が完了しました。ようこそ、{user.name} さん。
        </Alert>
      )}
      {sp.error === 'forbidden' && (
        <Alert tone="error" className="mb-6">
          そのページにアクセスする権限がありません。
        </Alert>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-12">
          {/* 参加予定 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-kampo-900">参加予定のイベント</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="参加予定のイベントはありません"
                description="イベント一覧から気になるものを探してみてください。"
                actionLabel="イベントを探す"
                actionHref="/events"
              />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={a.status === 'ATTENDING' ? 'green' : 'gray'}>
                        {ATTENDANCE_LABEL[a.status]}
                      </Badge>
                      <time className="text-xs text-gray-500">
                        {formatDateTime(a.event.startsAt)}
                      </time>
                    </div>
                    <h3 className="mt-2 font-semibold text-kampo-900">
                      <Link href={`/events/${a.event.id}`} className="hover:underline">
                        {a.event.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{a.event.location}</p>
                    {a.note && (
                      <p className="mt-2 rounded bg-sand-50 px-3 py-2 text-xs text-gray-600">
                        連絡事項：{a.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 参加履歴 */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-kampo-900">参加履歴</h2>
              <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-white">
                {past.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
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
            </section>
          )}

          {/* プロフィール編集 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-kampo-900">プロフィール</h2>
            <div className="rounded-lg border border-sand-200 bg-white p-6">
              <ProfileForm
                defaultValues={{
                  name: user.name,
                  affiliation: user.affiliation,
                  bio: user.bio,
                }}
              />
            </div>
          </section>

          {/* パスワード変更 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-kampo-900">パスワードの変更</h2>
            <div className="rounded-lg border border-sand-200 bg-white p-6">
              <PasswordForm />
            </div>
          </section>
        </div>

        {/* サイドバー */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-sand-200 bg-white p-6">
            <h2 className="text-base font-bold text-kampo-900">登録情報</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">お名前</dt>
                <dd className="font-medium text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">メールアドレス</dt>
                <dd className="break-all font-medium text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">所属</dt>
                <dd className="font-medium text-gray-900">{user.affiliation ?? '未設定'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">権限</dt>
                <dd>
                  <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                    {ROLE_DESCRIPTION[user.role]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">登録日</dt>
                <dd className="font-medium text-gray-900">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-sand-200 pt-6 text-center">
              <div>
                <dt className="text-xs text-gray-500">参加予定</dt>
                <dd className="text-xl font-bold text-kampo-800">{upcoming.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">参加履歴</dt>
                <dd className="text-xl font-bold text-kampo-800">{past.length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
