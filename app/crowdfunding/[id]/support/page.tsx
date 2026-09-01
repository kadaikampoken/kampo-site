/**
 * app/crowdfunding/[id]/support/page.tsx
 * プロジェクトを指定した支援ページ（振込先の表示・コピー・振込報告）
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getBankAccount } from '@/lib/bank';
import { isProjectVisible, visibleProjectWhere } from '@/lib/visibility';
import { Breadcrumbs } from '@/components/common/page-header';
import { SupportFlow } from '@/components/support-flow';
import { Alert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';
import { truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { title: true, status: true, publishAt: true },
  });
  if (!project || !isProjectVisible(project)) return { title: 'ページが見つかりません' };
  return {
    title: `${project.title} を支援する`,
    description: '銀行振込によるご支援の手順と、振込先口座のご案内です。',
  };
}

export default async function ProjectSupportPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();
  if (!isProjectVisible(project) && !isAdmin) notFound();

  const [account, projects] = await Promise.all([
    getBankAccount(),
    prisma.project.findMany({
      where: { ...visibleProjectWhere(), acceptingSupport: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'クラウドファンディング', href: '/crowdfunding' },
          { label: truncate(project.title, 20), href: `/crowdfunding/${project.id}` },
          { label: '支援する' },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight text-kampo-900 sm:text-3xl">
        銀行振込でご支援いただく
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        当サイトではクレジットカード決済を扱っておりません。
        お手数ですが、下記の口座へお振込のうえ、フォームからご報告をお願いいたします。
      </p>

      {!project.acceptingSupport && (
        <Alert tone="warning" className="mt-6">
          このプロジェクトは現在、振込による支援の受付を停止しています。
          会の活動全般へのご支援は引き続き受け付けております。
        </Alert>
      )}

      <div className="mt-10">
        <SupportFlow
          account={account}
          projects={projects}
          currentProject={
            project.acceptingSupport
              ? {
                  id: project.id,
                  title: project.title,
                  summary: project.summary,
                  goalAmount: project.goalAmount,
                  endDate: project.endDate,
                  acceptingSupport: project.acceptingSupport,
                }
              : null
          }
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href={`/crowdfunding/${project.id}`} variant="outline">
          プロジェクト詳細へ戻る
        </LinkButton>
        <LinkButton href="/crowdfunding/results" variant="ghost">
          これまでの支援実績を見る
        </LinkButton>
      </div>
    </div>
  );
}
