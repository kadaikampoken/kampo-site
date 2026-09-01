/**
 * app/crowdfunding/results/page.tsx
 * 支援実績の公開ページ。
 *
 * 公開するもの：月間支援総額／月間支援者数／累計／掲載を許可した支援者名／支援金の用途
 * 公開しないもの：個人ごとの支援金額、氏名以外の個人情報（メール・振込名義など）
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { LinkButton } from '@/components/ui/button';
import { getPublicSupporterNames } from '@/lib/donations';
import { visibleProjectWhere } from '@/lib/visibility';
import { formatYen } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '支援実績',
  description:
    '鹿児島大学漢方医学研究会にお寄せいただいたご支援の実績（月別・累計）と、ご支援くださった皆様のご芳名です。',
};

type SearchParams = Promise<{ projectId?: string }>;

export default async function ResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const projectId = sp.projectId;
  const projectKey = projectId ?? 'ALL';

  const [summaries, projects, selectedProject] = await Promise.all([
    prisma.monthlySummary.findMany({
      where: { published: true, projectKey },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.project.findMany({
      where: visibleProjectWhere(),
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, fundUsage: true },
    }),
    projectId
      ? prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, title: true, fundUsage: true },
        })
      : Promise.resolve(null),
  ]);

  // 各月のご芳名を取得（掲載許可した方のみ・金額は取得しない）
  const supporterLists = await Promise.all(
    summaries.map((s) => getPublicSupporterNames(s.year, s.month, projectId ?? null))
  );

  const cumulativeAmount = summaries.reduce((sum, s) => sum + s.totalAmount, 0);
  const cumulativeSupporters = summaries.reduce((sum, s) => sum + s.uniqueSupporterCount, 0);
  const cumulativeDonations = summaries.reduce((sum, s) => sum + s.donationCount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        title="支援実績"
        description="温かいご支援をいただき、誠にありがとうございます。実績は毎月末に入金確認を行ったうえで更新しています。"
        breadcrumbs={[
          { label: 'クラウドファンディング', href: '/crowdfunding' },
          { label: '支援実績' },
        ]}
      />

      {/* プロジェクト絞り込み */}
      <nav aria-label="対象の絞り込み" className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/crowdfunding/results"
          className={
            !projectId
              ? 'rounded-full bg-kampo-700 px-4 py-1.5 text-sm text-white'
              : 'rounded-full border border-sand-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-kampo-50'
          }
        >
          全体
        </Link>
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/crowdfunding/results?projectId=${p.id}`}
            className={
              projectId === p.id
                ? 'rounded-full bg-kampo-700 px-4 py-1.5 text-sm text-white'
                : 'rounded-full border border-sand-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-kampo-50'
            }
          >
            {p.title}
          </Link>
        ))}
      </nav>

      {/* 累計 */}
      <section className="mb-10 rounded-lg border-2 border-kampo-300 bg-white p-6">
        <h2 className="text-base font-bold text-kampo-900">
          累計{selectedProject ? `（${selectedProject.title}）` : '（会の活動全体）'}
        </h2>
        <dl className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">累計支援総額</dt>
            <dd className="mt-1 text-3xl font-bold text-kampo-800">
              {formatYen(cumulativeAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">累計支援者数（延べ人数）</dt>
            <dd className="mt-1 text-3xl font-bold text-kampo-800">{cumulativeSupporters}名</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">累計支援件数</dt>
            <dd className="mt-1 text-3xl font-bold text-kampo-800">{cumulativeDonations}件</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          ※「支援者数（延べ人数）」は各月の実人数を合計したものです。
          同じ方が複数の月にご支援くださった場合、月ごとに1名として数えています。
          「支援件数」はお振込1回を1件として数えた延べ件数です。
        </p>
      </section>

      {/* 支援金の用途 */}
      {selectedProject?.fundUsage && (
        <section className="mb-10 rounded-lg border border-sand-200 bg-white p-6">
          <h2 className="text-base font-bold text-kampo-900">支援金の用途</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {selectedProject.fundUsage}
          </p>
        </section>
      )}

      {/* 月別 */}
      <h2 className="mb-4 text-lg font-bold text-kampo-900">月別の支援実績</h2>

      {summaries.length === 0 ? (
        <EmptyState
          title="公開されている支援実績はまだありません"
          description="毎月末に入金確認を行い、集計が確定次第こちらに掲載します。"
          actionLabel="ご支援について見る"
          actionHref="/crowdfunding/support"
        />
      ) : (
        <div className="space-y-6">
          {summaries.map((summary, i) => {
            const supporters = supporterLists[i];
            return (
              <section
                key={summary.id}
                className="rounded-lg border border-sand-200 bg-white p-6"
              >
                <h3 className="text-lg font-bold text-kampo-900">
                  {summary.year}年{summary.month}月 支援実績
                </h3>

                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-gray-500">支援総額</dt>
                    <dd className="mt-0.5 text-xl font-bold text-kampo-800">
                      {formatYen(summary.totalAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">支援者数（実人数）</dt>
                    <dd className="mt-0.5 text-xl font-bold text-kampo-800">
                      {summary.uniqueSupporterCount}名
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">支援件数（延べ）</dt>
                    <dd className="mt-0.5 text-xl font-bold text-kampo-800">
                      {summary.donationCount}件
                    </dd>
                  </div>
                </dl>

                {(supporters.names.length > 0 || supporters.anonymousCount > 0) && (
                  <div className="mt-6 border-t border-sand-200 pt-5">
                    <h4 className="text-sm font-semibold text-kampo-900">
                      ご支援いただいた皆様
                    </h4>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-800">
                      {supporters.names.map((name) => (
                        <li key={name}>{name} 様</li>
                      ))}
                      {supporters.anonymousCount > 0 && (
                        <li className="text-gray-600">匿名希望の皆様</li>
                      )}
                    </ul>
                    <p className="mt-3 text-xs text-gray-500">
                      ※ 掲載のご許可をいただいた方のみお名前を記載しています（敬称略・順不同）。
                      個人ごとのご支援額は公開しておりません。
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <LinkButton href="/crowdfunding/support">ご支援について</LinkButton>
        <LinkButton href="/crowdfunding" variant="outline">
          プロジェクト一覧へ
        </LinkButton>
      </div>
    </div>
  );
}
