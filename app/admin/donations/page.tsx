/**
 * app/admin/donations/page.tsx
 * 支援報告（振込報告）の一覧と入金確認。
 *
 * このページは管理者専用（app/admin/layout.tsx の requireAdmin で保護）。
 * 氏名・メールアドレス・振込名義・個人別の支援金額はここでのみ閲覧できる。
 */
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { DeleteButton } from '@/components/admin/delete-button';
import { DonationStatusForm } from '@/components/admin/donation-status-form';
import { deleteDonationAction } from '@/app/actions/donations';
import { formatDate, formatDateTime, formatYen } from '@/lib/utils';
import {
  ADMIN_PAGE_SIZE,
  DONATION_STATUS_LABEL,
  DONATION_STATUS_TONE,
  DONOR_DISCLOSURE_LABEL,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: '支援報告の管理' };

type SearchParams = Promise<Record<string, string | undefined>>;

const STATUS_KEYS = ['REPORTED', 'CONFIRMED', 'VOID'] as const;

export default async function AdminDonationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const q = (sp.q ?? '').trim();
  const projectId = sp.projectId;
  const status = STATUS_KEYS.find((k) => k === sp.status);

  const where: Prisma.DonationWhereInput = {
    ...(status ? { status } : {}),
    ...(projectId ? { projectId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { transferName: { contains: q, mode: 'insensitive' as const } },
            { displayName: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [total, donations, projects, counts, sums] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      orderBy: [{ transferDate: 'desc' }, { reportedAt: 'desc' }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { project: { select: { id: true, title: true } } },
    }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true } }),
    prisma.donation.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.donation.aggregate({ where, _sum: { amount: true } }),
  ]);

  const countOf = (key: string) =>
    counts.find((c) => c.status === key)?._count._all ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const buildHref = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: q || undefined, projectId, status: sp.status, ...next };
    for (const [k, val] of Object.entries(merged)) if (val) params.set(k, val);
    const qs = params.toString();
    return qs ? `/admin/donations?${qs}` : '/admin/donations';
  };

  return (
    <div>
      <PageHeader
        title="支援報告の管理"
        description="支援者から送信された振込報告の一覧です。通帳・ネットバンキングで入金を確認したら「入金確認済み」に変更してください。"
      />

      {/* 状態サマリー */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-800">入金未確認</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{countOf('REPORTED')} 件</p>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <p className="text-xs text-gray-500">入金確認済み</p>
          <p className="mt-1 text-2xl font-bold text-kampo-800">{countOf('CONFIRMED')} 件</p>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <p className="text-xs text-gray-500">確認不要／無効</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">{countOf('VOID')} 件</p>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-4">
          <p className="text-xs text-gray-500">絞り込み結果の合計額</p>
          <p className="mt-1 text-2xl font-bold text-kampo-800">
            {formatYen(sums._sum.amount ?? 0)}
          </p>
        </div>
      </div>

      {/* 検索・絞り込み */}
      <form action="/admin/donations" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-gray-600">
            氏名・メール・振込名義で検索
          </label>
          <input
            id="q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="カダイ タロウ"
            className="w-full min-w-[16rem] rounded-md border border-sand-300 px-3 py-2 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
          />
        </div>
        <div>
          <label htmlFor="projectId" className="mb-1 block text-xs font-medium text-gray-600">
            プロジェクト
          </label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={projectId ?? ''}
            className="w-full min-w-[14rem] rounded-md border border-sand-300 px-3 py-2 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
          >
            <option value="">すべて</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
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
        {(q || projectId || status) && (
          <Link href="/admin/donations" className="text-sm text-gray-600 underline">
            条件をクリア
          </Link>
        )}
      </form>

      {/* 状態タブ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: undefined, label: 'すべて' },
          { key: 'REPORTED', label: '入金未確認' },
          { key: 'CONFIRMED', label: '入金確認済み' },
          { key: 'VOID', label: '確認不要／無効' },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={buildHref({ status: tab.key, page: undefined })}
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

      {donations.length === 0 ? (
        <EmptyState
          title="該当する支援報告がありません"
          description="支援者が振込完了フォームを送信すると、こちらに表示されます。"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
            <table className="w-full min-w-[70rem] text-sm">
              <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">支援者</th>
                  <th scope="col" className="px-4 py-3 font-medium">掲載希望名</th>
                  <th scope="col" className="px-4 py-3 font-medium">プロジェクト</th>
                  <th scope="col" className="px-4 py-3 font-medium">支援金額</th>
                  <th scope="col" className="px-4 py-3 font-medium">振込名義</th>
                  <th scope="col" className="px-4 py-3 font-medium">振込日</th>
                  <th scope="col" className="px-4 py-3 font-medium">報告日時</th>
                  <th scope="col" className="px-4 py-3 font-medium">入金確認</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {donations.map((d) => (
                  <tr key={d.id} className="align-top hover:bg-sand-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{d.name}</p>
                      <p className="break-all text-xs text-gray-500">{d.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">
                        {d.disclosure === 'REAL_NAME'
                          ? d.name
                          : d.disclosure === 'CUSTOM_NAME'
                            ? (d.displayName ?? '—')
                            : '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {DONOR_DISCLOSURE_LABEL[d.disclosure]}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {d.project ? (
                        <Link
                          href={`/admin/donations?projectId=${d.project.id}`}
                          className="hover:underline"
                        >
                          {d.project.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500">指定なし</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-kampo-800">
                      {formatYen(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{d.transferName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                      {formatDate(d.transferDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {formatDateTime(d.reportedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={DONATION_STATUS_TONE[d.status]}>
                        {DONATION_STATUS_LABEL[d.status]}
                      </Badge>
                      {d.confirmedAt && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(d.confirmedAt)} 確認
                        </p>
                      )}
                      <div className="mt-2">
                        <DonationStatusForm id={d.id} currentStatus={d.status} />
                      </div>
                      {d.note && (
                        <p className="mt-2 max-w-[14rem] rounded bg-sand-50 px-2 py-1 text-xs text-gray-600">
                          備考：{d.note}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <DeleteButton
                        action={deleteDonationAction}
                        hiddenFields={{ id: d.id }}
                        confirmMessage={`${d.name} さんの支援報告を削除します。よろしいですか？`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/donations"
            searchParams={{ q: q || undefined, projectId, status: sp.status }}
          />
        </>
      )}

      <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        このページに表示される氏名・メールアドレス・振込名義・個人別の支援金額は、
        管理者のみが閲覧できます。一般公開ページには、掲載を許可した方のお名前のみを表示し、
        個人ごとの金額は一切公開されません。
      </p>
    </div>
  );
}
