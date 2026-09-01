/**
 * app/crowdfunding/support/page.tsx
 * プロジェクトを限定しない支援ページ（会の活動全般へのご支援）
 */
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getBankAccount } from '@/lib/bank';
import { visibleProjectWhere } from '@/lib/visibility';
import { PageHeader } from '@/components/common/page-header';
import { SupportFlow } from '@/components/support-flow';
import { LinkButton } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ご支援について',
  description:
    '鹿児島大学漢方医学研究会への銀行振込によるご支援の手順と、振込先口座のご案内です。',
};

export default async function SupportPage() {
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
      <PageHeader
        title="ご支援について"
        description="銀行振込によるご支援を受け付けています。いただいたご支援は、勉強会の運営・生薬標本の整備・地域講座の実施などに使わせていただきます。"
        breadcrumbs={[
          { label: 'クラウドファンディング', href: '/crowdfunding' },
          { label: 'ご支援について' },
        ]}
      />

      <SupportFlow account={account} projects={projects} />

      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/crowdfunding" variant="outline">
          プロジェクト一覧へ
        </LinkButton>
        <LinkButton href="/crowdfunding/results" variant="ghost">
          これまでの支援実績を見る
        </LinkButton>
      </div>
    </div>
  );
}
