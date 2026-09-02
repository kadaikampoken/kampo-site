/**
 * app/members/page.tsx
 * 会員一覧（ログインした会員のみ閲覧可）。
 *
 * プライバシー方針：
 *   メールアドレスは管理者にのみ表示する。
 *   未ログインのアクセスは middleware と requireUser の二重で遮断される。
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { requireUser, isAdmin } from '@/lib/auth-guard';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ROLE_LABEL, ROLE_TONE, PAGE_SIZE } from '@/lib/constants';
import { formatDate, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '会員一覧',
  description: '鹿児島大学漢方医学研究会の会員一覧です。',
  // 会員限定ページのため検索エンジンには載せない
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ page?: string; q?: string }>;

const MEMBER_PAGE_SIZE = PAGE_SIZE * 2;

export default async function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requireUser('/members');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const q = (sp.q ?? '').trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { affiliation: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [total, members, roleCounts] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      skip: (page - 1) * MEMBER_PAGE_SIZE,
      take: MEMBER_PAGE_SIZE,
      // 一覧に必要な項目だけを取得する（メールアドレスは取得しない）
      select: {
        id: true,
        name: true,
        affiliation: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: { select: { attendances: true } },
      },
    }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
  ]);

  const countOf = (role: string) => roleCounts.find((r) => r.role === role)?._count._all ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MEMBER_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <PageHeader
        title="会員一覧"
        description="会の登録会員の一覧です。お名前をクリックすると詳細を確認できます。"
        breadcrumbs={[{ label: '会員一覧' }]}
      />

      <p className="mb-6 rounded-md border border-sand-200 bg-white px-4 py-3 text-xs leading-relaxed text-gray-600">
        このページはログインした会員のみが閲覧できます。
        メールアドレスなどの連絡先は表示されません（管理者を除く）。
      </p>

      {/* サマリー */}
      <dl className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <dt className="text-xs text-gray-500">登録会員</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">{total} 名</dd>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <dt className="text-xs text-gray-500">管理者</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">{countOf('ADMIN')} 名</dd>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <dt className="text-xs text-gray-500">サポーター</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">{countOf('SUPPORTER')} 名</dd>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <dt className="text-xs text-gray-500">一般会員</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">{countOf('USER')} 名</dd>
        </div>
      </dl>

      {/* 検索 */}
      <form action="/members" className="mb-8 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="お名前・所属で検索"
          className="w-full max-w-sm rounded-md border border-sand-300 px-3 py-2 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-kampo-700 px-4 py-2 text-sm font-medium text-white hover:bg-kampo-800"
        >
          検索
        </button>
      </form>

      {members.length === 0 ? (
        <EmptyState
          title="該当する会員が見つかりません"
          description={q ? '検索条件を変更してお試しください。' : undefined}
          actionLabel={q ? 'すべて表示' : undefined}
          actionHref={q ? '/members' : undefined}
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/members/${m.id}`}
                  className="flex h-full flex-col rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-kampo-900">
                        {m.name}
                        {m.id === viewer.id && (
                          <span className="ml-2 text-xs font-normal text-kampo-700">(あなた)</span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {m.affiliation ?? '所属未設定'}
                      </p>
                    </div>
                    <Badge tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</Badge>
                  </div>

                  {m.bio && (
                    <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
                      {truncate(m.bio, 60)}
                    </p>
                  )}

                  <dl className="mt-4 flex gap-6 text-xs text-gray-500">
                    <div className="flex gap-1.5">
                      <dt>参加</dt>
                      <dd className="font-medium text-gray-700">{m._count.attendances} 件</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt>登録</dt>
                      <dd className="font-medium text-gray-700">{formatDate(m.createdAt)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/members"
            searchParams={{ q: q || undefined }}
          />
        </>
      )}

      {isAdmin(viewer.role) && (
        <p className="mt-8 text-sm text-gray-600">
          権限の変更や削除は{' '}
          <Link href="/admin/users" className="text-kampo-700 underline">
            管理画面のユーザー管理
          </Link>{' '}
          から行えます。
        </p>
      )}
    </div>
  );
}
