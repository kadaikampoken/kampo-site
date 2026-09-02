/**
 * app/admin/users/page.tsx  （項目42：ユーザー管理）
 */
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { DeleteButton } from '@/components/admin/delete-button';
import { RoleForm } from '@/components/admin/role-form';
import { deleteUserAction } from '@/app/actions/users';
import { formatDate } from '@/lib/utils';
import { ADMIN_PAGE_SIZE, ROLE_LABEL, ROLE_TONE, ROLE_DESCRIPTION } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ユーザー管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const q = (sp.q ?? '').trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [total, users, adminCount, supporterCount] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { _count: { select: { attendances: true } } },
    }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'SUPPORTER' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="ユーザー管理"
        description={`全 ${total} 名（うち管理者 ${adminCount} 名／サポーター ${supporterCount} 名）。パスワードはハッシュ化して保存されており、閲覧・復元はできません。`}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(['ADMIN', 'SUPPORTER', 'USER'] as const).map((r) => (
          <div key={r} className="rounded-lg border border-sand-200 bg-white p-4">
            <p className="text-sm font-semibold text-kampo-900">{ROLE_LABEL[r]}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{ROLE_DESCRIPTION[r]}</p>
          </div>
        ))}
      </div>

      {/* 検索 */}
      <form className="mb-6 flex gap-2" action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="氏名・メールアドレスで検索"
          className="w-full max-w-sm rounded-md border border-sand-300 px-3 py-2 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-kampo-700 px-4 py-2 text-sm font-medium text-white hover:bg-kampo-800"
        >
          検索
        </button>
      </form>

      {users.length === 0 ? (
        <EmptyState
          title="該当するユーザーが見つかりません"
          description={q ? '検索条件を変更してお試しください。' : undefined}
          actionLabel={q ? 'すべて表示' : undefined}
          actionHref={q ? '/admin/users' : undefined}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
            <table className="w-full min-w-[54rem] text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">ユーザー</th>
                  <th scope="col" className="px-4 py-3 font-medium">所属</th>
                  <th scope="col" className="px-4 py-3 font-medium">参加</th>
                  <th scope="col" className="px-4 py-3 font-medium">権限</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {users.map((u) => {
                  const isSelf = u.id === me.id;
                  return (
                    <tr key={u.id} className="hover:bg-sand-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {u.name}
                          {isSelf && <span className="ml-2 text-xs text-kampo-700">(あなた)</span>}
                        </p>
                        <p className="break-all text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">登録 {formatDate(u.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{u.affiliation ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{u._count.attendances} 件</td>
                      <td className="px-4 py-3">
                        <div className="mb-2">
                          <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                          <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-gray-500">
                            {ROLE_DESCRIPTION[u.role]}
                          </p>
                        </div>
                        <RoleForm userId={u.id} currentRole={u.role} disabled={isSelf} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <DeleteButton
                            action={deleteUserAction}
                            hiddenFields={{ userId: u.id }}
                            confirmMessage={`${u.name} さんを削除します。参加登録もすべて削除されます。よろしいですか？`}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/users"
            searchParams={{ q: q || undefined }}
          />
        </>
      )}
    </div>
  );
}
