/**
 * app/admin/crowdfunding/page.tsx  （項目39）
 */
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guard';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { DeleteButton } from '@/components/admin/delete-button';
import { Flash } from '@/components/admin/flash';
import { deleteProjectAction } from '@/app/actions/crowdfunding';
import { achievementRate, formatDate, formatDateTime, formatYen, truncate } from '@/lib/utils';
import { projectState, PUBLISH_STATE_LABEL, PUBLISH_STATE_TONE } from '@/lib/visibility';
import { PROJECT_STATUS_LABEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'クラウドファンディング管理' };

const tone = {
  DRAFT: 'gray',
  ACTIVE: 'green',
  SUCCEEDED: 'amber',
  CLOSED: 'gray',
} as const;

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminCrowdfundingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 管理者専用ページ（サポーターはアクセス不可）
  await requireAdmin();

  const sp = await searchParams;
  const now = new Date();
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div>
      <PageHeader
        title="クラウドファンディング管理"
        description="支援額・支援者数は外部サービスの値を見ながら手動で更新します。"
        action={<LinkButton href="/admin/crowdfunding/new">新規作成</LinkButton>}
      />

      <Flash params={sp} />

      {projects.length === 0 ? (
        <EmptyState
          title="プロジェクトがまだありません"
          actionLabel="新規作成"
          actionHref="/admin/crowdfunding/new"
        />
      ) : (
        <ul className="space-y-4">
          {projects.map((p) => {
            const hasGoal = p.goalAmount !== null && p.goalAmount > 0;
            const rate = hasGoal ? achievementRate(p.currentAmount, p.goalAmount ?? 0) : 0;
            return (
              <li key={p.id} className="rounded-lg border border-sand-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone={tone[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                      <Badge tone={PUBLISH_STATE_TONE[projectState(p, now)]}>
                        {PUBLISH_STATE_LABEL[projectState(p, now)]}
                      </Badge>
                      {projectState(p, now) === 'SCHEDULED' && (
                        <span className="text-xs text-amber-800">
                          {formatDateTime(p.publishAt)} に公開
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {p.startDate ? formatDate(p.startDate) : '開始日未設定'} 〜{' '}
                        {p.endDate ? formatDate(p.endDate) : '終了日未設定'}
                      </span>
                    </div>
                    <Link
                      href={`/crowdfunding/${p.id}`}
                      className="text-base font-semibold text-kampo-900 hover:underline"
                    >
                      {truncate(p.title, 44)}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      href={`/admin/donations?projectId=${p.id}`}
                      className="text-sm font-medium text-kampo-700 hover:underline"
                    >
                      支援一覧
                    </Link>
                    <Link
                      href={`/admin/crowdfunding/${p.id}/edit`}
                      className="text-sm font-medium text-kampo-700 hover:underline"
                    >
                      編集
                    </Link>
                    <DeleteButton
                      action={deleteProjectAction}
                      hiddenFields={{ id: p.id }}
                      confirmMessage={`「${p.title}」を削除します。よろしいですか？`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-kampo-800">
                      {formatYen(p.currentAmount)}{' '}
                      <span className="font-normal text-gray-500">
                        / {hasGoal ? formatYen(p.goalAmount ?? 0) : '目標なし'}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      {hasGoal ? `${rate}%・` : ''}
                      {p.supporterCount}人
                    </span>
                  </div>
                  {hasGoal && <ProgressBar rate={rate} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
