/**
 * app/admin/monthly/page.tsx
 * 月次集計の確定と、確定済み実績の管理。
 */
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { DeleteButton } from '@/components/admin/delete-button';
import { MonthlyConfirmForm } from '@/components/admin/monthly-confirm-form';
import {
  toggleMonthlyPublishedAction,
  deleteMonthlySummaryAction,
} from '@/app/actions/monthly';
import { aggregateConfirmedDonations } from '@/lib/donations';
import { formatDateTime, formatYen } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: '月次集計' };

export default async function AdminMonthlyPage() {
  const now = new Date();
  // 既定は「先月」（月末に前月分を確定する運用を想定）
  const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultYear = target.getFullYear();
  const defaultMonth = target.getMonth() + 1;

  const [summaries, projects, pendingCount, previewCurrent, previewPrev] = await Promise.all([
    prisma.monthlySummary.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { projectKey: 'asc' }],
      include: { project: { select: { id: true, title: true } } },
    }),
    prisma.project.findMany({ select: { id: true, title: true } }),
    prisma.donation.count({ where: { status: 'REPORTED' } }),
    aggregateConfirmedDonations(now.getFullYear(), now.getMonth() + 1, null),
    aggregateConfirmedDonations(defaultYear, defaultMonth, null),
  ]);

  const projectTitle = (key: string) =>
    key === 'ALL' ? 'サイト全体' : (projects.find((p) => p.id === key)?.title ?? '（削除済み）');

  return (
    <div>
      <PageHeader
        title="月次集計"
        description="毎月末に入金確認を済ませたうえで、その月の支援実績を確定します。確定した内容が公開ページに掲載されます。"
      />

      {pendingCount > 0 && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>入金未確認の支援報告が {pendingCount} 件あります。</strong>{' '}
          集計の前に
          <Link href="/admin/donations?status=REPORTED" className="mx-1 underline">
            支援報告の管理
          </Link>
          で入金確認を済ませてください。
        </div>
      )}

      {/* 確定前のプレビュー */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <p className="text-xs text-gray-500">
            今月（{now.getFullYear()}年{now.getMonth() + 1}月）の入金確認済み
          </p>
          <p className="mt-1 text-2xl font-bold text-kampo-800">
            {formatYen(previewCurrent.totalAmount)}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            実人数 {previewCurrent.uniqueSupporterCount}名／延べ {previewCurrent.donationCount}件
          </p>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <p className="text-xs text-gray-500">
            先月（{defaultYear}年{defaultMonth}月）の入金確認済み
          </p>
          <p className="mt-1 text-2xl font-bold text-kampo-800">
            {formatYen(previewPrev.totalAmount)}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            実人数 {previewPrev.uniqueSupporterCount}名／延べ {previewPrev.donationCount}件
          </p>
        </div>
      </div>

      <div className="mb-10">
        <MonthlyConfirmForm defaultYear={defaultYear} defaultMonth={defaultMonth} />
      </div>

      <h2 className="mb-4 text-lg font-bold text-kampo-900">確定済みの月次実績</h2>

      {summaries.length === 0 ? (
        <EmptyState
          title="確定済みの実績はまだありません"
          description="上のフォームから年月を指定して確定してください。"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white">
          <table className="w-full min-w-[54rem] text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-left text-xs text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">対象月</th>
                <th scope="col" className="px-4 py-3 font-medium">対象</th>
                <th scope="col" className="px-4 py-3 font-medium">支援総額</th>
                <th scope="col" className="px-4 py-3 font-medium">支援者数（実人数）</th>
                <th scope="col" className="px-4 py-3 font-medium">支援件数（延べ）</th>
                <th scope="col" className="px-4 py-3 font-medium">公開</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {summaries.map((s) => (
                <tr key={s.id} className="hover:bg-sand-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-kampo-900">
                    {s.year}年{s.month}月
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.projectKey === 'ALL' ? (
                      <span className="font-medium">サイト全体</span>
                    ) : (
                      projectTitle(s.projectKey)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-kampo-800">
                    {formatYen(s.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.uniqueSupporterCount} 名</td>
                  <td className="px-4 py-3 text-gray-700">{s.donationCount} 件</td>
                  <td className="px-4 py-3">
                    <form action={toggleMonthlyPublishedAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" title="クリックで公開/非公開を切り替え">
                        <Badge tone={s.published ? 'green' : 'gray'}>
                          {s.published ? '公開中' : '非公開'}
                        </Badge>
                      </button>
                    </form>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(s.confirmedAt)} 確定
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteMonthlySummaryAction}
                      hiddenFields={{ id: s.id }}
                      confirmMessage={`${s.year}年${s.month}月（${s.projectKey === 'ALL' ? 'サイト全体' : projectTitle(s.projectKey)}）の実績を削除します。よろしいですか？`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 rounded-md border border-sand-200 bg-sand-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
        ※「支援者数（実人数）」は、その月にご支援くださった方をメールアドレス単位で重複を除いて数えた人数です。
        「支援件数（延べ）」はお振込1回を1件として数えた件数です。
        公開ページの累計は、各月の実人数を合計した「延べ人数」として表示しています。
      </p>
    </div>
  );
}
