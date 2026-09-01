/**
 * app/crowdfunding/[id]/page.tsx  （項目28：クラウドファンディング詳細）
 * 支援の募集目的・支援金の用途・支援方法（銀行振込）を掲載する。
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/page-header';
import { ArticleBody } from '@/components/common/article-body';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LinkButton } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { getBankAccount } from '@/lib/bank';
import { BankAccountCard } from '@/components/bank-account-card';
import { isProjectVisible, projectState } from '@/lib/visibility';
import { getPublishedTotals } from '@/lib/donations';
import { achievementRate, daysLeft, formatDate, formatYen, truncate } from '@/lib/utils';
import { PROJECT_STATUS_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { title: true, summary: true, status: true, publishAt: true },
  });
  if (!project || !isProjectVisible(project)) return { title: 'プロジェクトが見つかりません' };
  return { title: project.title, description: truncate(project.summary, 120) };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  // 準備中・予約公開は管理者のみ閲覧可
  const state = projectState(project);
  if (state !== 'PUBLISHED' && !isAdmin) notFound();

  const [account, totals] = await Promise.all([getBankAccount(), getPublishedTotals(project.id)]);

  const hasGoal = project.goalAmount !== null && project.goalAmount > 0;
  const rate = hasGoal ? achievementRate(project.currentAmount, project.goalAmount ?? 0) : 0;
  const remaining = project.endDate ? daysLeft(project.endDate) : null;
  const isActive = project.status === 'ACTIVE';
  const canSupport = isActive && project.acceptingSupport;

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'クラウドファンディング', href: '/crowdfunding' },
          { label: truncate(project.title, 24) },
        ]}
      />

      {state === 'DRAFT' && (
        <Alert tone="warning" className="mb-6">
          このプロジェクトは<strong>準備中</strong>です。管理者のみ閲覧できます。
        </Alert>
      )}
      {state === 'SCHEDULED' && (
        <Alert tone="warning" className="mb-6">
          このプロジェクトは<strong>予約公開</strong>です。
          {formatDate(project.publishAt)}以降に自動で一般公開されます。
        </Alert>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        {/* 本文 */}
        <article>
          <div className="mb-4">
            <Badge tone={isActive ? 'green' : project.status === 'SUCCEEDED' ? 'amber' : 'gray'}>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-kampo-900 sm:text-3xl">
            {project.title}
          </h1>
          <p className="mt-4 rounded-md bg-sand-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {project.summary}
          </p>

          <div className="mt-10">
            <ArticleBody text={project.description} />
          </div>

          {/* 支援を募集する目的 */}
          {project.purpose && (
            <section className="mt-12">
              <h2 className="mb-4 text-lg font-bold text-kampo-900">支援を募集する目的</h2>
              <ArticleBody text={project.purpose} />
            </section>
          )}

          {/* 支援金の用途 */}
          {project.fundUsage && (
            <section className="mt-12">
              <h2 className="mb-4 text-lg font-bold text-kampo-900">支援金の用途</h2>
              <div className="rounded-lg border border-sand-200 bg-white p-5">
                <ArticleBody text={project.fundUsage} />
              </div>
            </section>
          )}

          {/* 支援方法 */}
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-kampo-900">支援方法</h2>
            {canSupport ? (
              <>
                <p className="mb-5 text-sm leading-relaxed text-gray-700">
                  ご支援は<strong>銀行振込</strong>で受け付けています。
                  下記の口座へお振込みいただいたのち、支援ページの「振込完了フォーム」から
                  ご報告をお願いいたします。クレジットカード決済には対応しておりません。
                </p>
                <BankAccountCard account={account} />
                <div className="mt-5">
                  <LinkButton href={`/crowdfunding/${project.id}/support`} size="lg">
                    支援の手順を見る・振込を報告する
                  </LinkButton>
                </div>
              </>
            ) : (
              <p className="rounded-md border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-gray-600">
                {isActive
                  ? 'このプロジェクトは現在、振込による支援の受付を停止しています。'
                  : 'このプロジェクトの募集は終了しました。温かいご支援をありがとうございました。'}
              </p>
            )}
          </section>
        </article>

        {/* サイドバー（支援状況） */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-sand-200 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-kampo-800">{formatYen(project.currentAmount)}</p>
            {hasGoal ? (
              <>
                <p className="mt-1 text-sm text-gray-600">
                  目標 {formatYen(project.goalAmount ?? 0)} /{' '}
                  <span className="font-semibold text-sand-700">{rate}%</span>
                </p>
                <ProgressBar rate={rate} className="mt-4" />
              </>
            ) : (
              <p className="mt-1 text-sm text-gray-600">目標金額は設定していません</p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-sand-200 pt-6 text-sm">
              <div>
                <dt className="text-gray-500">支援者数（延べ）</dt>
                <dd className="mt-1 text-lg font-semibold text-kampo-900">
                  {project.supporterCount} 名
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">{isActive ? '残り' : '募集期間'}</dt>
                <dd className="mt-1 text-lg font-semibold text-kampo-900">
                  {isActive && remaining !== null ? `${remaining} 日` : '—'}
                </dd>
              </div>
            </dl>

            <dl className="mt-4 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>募集開始</dt>
                <dd>{project.startDate ? formatDate(project.startDate) : '未設定'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>募集終了</dt>
                <dd>{project.endDate ? formatDate(project.endDate) : '未設定'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>支援件数（延べ）</dt>
                <dd>{totals.donationCount} 件</dd>
              </div>
            </dl>

            {canSupport ? (
              <LinkButton
                href={`/crowdfunding/${project.id}/support`}
                size="lg"
                className="mt-6 w-full"
              >
                このプロジェクトを支援する
              </LinkButton>
            ) : (
              <p className="mt-6 rounded-md bg-sand-100 px-4 py-3 text-center text-sm text-gray-600">
                {isActive ? '支援の受付を停止しています' : '募集は終了しました'}
              </p>
            )}

            {project.externalUrl && isActive && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-kampo-300 bg-white px-4 text-sm font-medium text-kampo-800 hover:bg-kampo-50"
              >
                外部の支援ページを見る
              </a>
            )}

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              ※ 支援総額・支援者数は、毎月末に入金確認を行ったうえで更新しています。
              個人ごとのご支援額は公開しておりません。
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <LinkButton href="/crowdfunding/results" variant="outline">
              支援実績を見る
            </LinkButton>
            <LinkButton href="/crowdfunding" variant="ghost">
              一覧へ戻る
            </LinkButton>
            {isAdmin && (
              <LinkButton href={`/admin/crowdfunding/${project.id}/edit`} variant="secondary">
                このプロジェクトを編集
              </LinkButton>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
