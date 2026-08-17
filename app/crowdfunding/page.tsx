/**
 * app/crowdfunding/page.tsx  （項目27：クラウドファンディング一覧）
 */
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { ProjectCard } from '@/components/cards/project-card';
import { Pagination } from '@/components/ui/pagination';
import { PAGE_SIZE } from '@/lib/constants';
import { formatYen } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'クラウドファンディング',
  description: '鹿児島大学漢方医学研究会が実施しているクラウドファンディングの一覧です。',
};

type SearchParams = Promise<{ page?: string }>;

export default async function CrowdfundingListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1') || 1);

  // 一般公開するのは DRAFT 以外
 const where: Prisma.ProjectWhereInput = {
    status: { in: ['ACTIVE', 'SUCCEEDED', 'CLOSED'] },
  };

  const [total, projects, aggregate] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ status: 'asc' }, { endDate: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.aggregate({
      where,
      _sum: { currentAmount: true, supporterCount: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const active = projects.filter((p) => p.status === 'ACTIVE');
  const others = projects.filter((p) => p.status !== 'ACTIVE');

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <PageHeader
        title="クラウドファンディング"
        description="学生主体の活動を継続するため、皆さまのご支援をお願いしています。"
        breadcrumbs={[{ label: 'クラウドファンディング' }]}
      />

      {/* サマリー */}
      <dl className="mb-10 grid gap-4 rounded-lg border border-sand-200 bg-white p-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-gray-500">累計支援額</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">
            {formatYen(aggregate._sum.currentAmount ?? 0)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">累計支援者数</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">
            {aggregate._sum.supporterCount ?? 0} 人
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">プロジェクト数</dt>
          <dd className="mt-1 text-2xl font-bold text-kampo-800">{total} 件</dd>
        </div>
      </dl>

      {projects.length === 0 ? (
        <EmptyState
          title="現在公開中のプロジェクトはありません"
          description="新しいプロジェクトを準備中です。公開までしばらくお待ちください。"
          actionLabel="お知らせを見る"
          actionHref="/news"
        />
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 text-lg font-bold text-kampo-900">募集中のプロジェクト</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {active.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="mb-5 text-lg font-bold text-kampo-900">これまでのプロジェクト</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          <Pagination currentPage={page} totalPages={totalPages} basePath="/crowdfunding" />
        </>
      )}
    </div>
  );
}
