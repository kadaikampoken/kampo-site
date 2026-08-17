/**
 * app/crowdfunding/[id]/page.tsx  （項目28：クラウドファンディング詳細）
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
import {
  achievementRate,
  daysLeft,
  formatDate,
  formatYen,
  truncate,
} from '@/lib/utils';
import { PROJECT_STATUS_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { title: true, summary: true, status: true },
  });
  if (!project || project.status === 'DRAFT') return { title: 'プロジェクトが見つかりません' };
  return { title: project.title, description: truncate(project.summary, 120) };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const project = await prisma.project.findUnique({ where: { id } });
  // 準備中（DRAFT）は管理者のみ閲覧可
  if (!project || (project.status === 'DRAFT' && !isAdmin)) notFound();

  const rate = achievementRate(project.currentAmount, project.goalAmount);
  const remaining = daysLeft(project.endDate);
  const isActive = project.status === 'ACTIVE';

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'クラウドファンディング', href: '/crowdfunding' },
          { label: truncate(project.title, 24) },
        ]}
      />

      {project.status === 'DRAFT' && (
        <Alert tone="warning" className="mb-6">
          このプロジェクトは<strong>準備中</strong>です。管理者のみ閲覧できます。
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
        </article>

        {/* サイドバー（支援状況） */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-sand-200 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-kampo-800">{formatYen(project.currentAmount)}</p>
            <p className="mt-1 text-sm text-gray-600">
              目標 {formatYen(project.goalAmount)} / <span className="font-semibold text-sand-700">{rate}%</span>
            </p>
            <ProgressBar rate={rate} className="mt-4" />

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-sand-200 pt-6 text-sm">
              <div>
                <dt className="text-gray-500">支援者数</dt>
                <dd className="mt-1 text-lg font-semibold text-kampo-900">
                  {project.supporterCount} 人
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">{isActive ? '残り' : '募集期間'}</dt>
                <dd className="mt-1 text-lg font-semibold text-kampo-900">
                  {isActive ? `${remaining} 日` : '終了'}
                </dd>
              </div>
            </dl>

            <dl className="mt-4 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>開始日</dt>
                <dd>{formatDate(project.startDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>終了日</dt>
                <dd>{formatDate(project.endDate)}</dd>
              </div>
            </dl>

            {project.externalUrl && isActive ? (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-kampo-700 px-6 text-base font-medium text-white hover:bg-kampo-800"
              >
                支援ページへ進む
              </a>
            ) : (
              <p className="mt-6 rounded-md bg-sand-100 px-4 py-3 text-center text-sm text-gray-600">
                {isActive ? '支援受付の準備中です' : 'このプロジェクトの募集は終了しました'}
              </p>
            )}

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              ※ 決済は外部のクラウドファンディングサービス上で行われます。
              本サイトでは決済情報を一切お預かりしません。
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <LinkButton href="/crowdfunding" variant="outline">
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
