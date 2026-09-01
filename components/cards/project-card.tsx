/**
 * components/cards/project-card.tsx
 * 目標金額・募集期間は「未設定」を許容する。
 */
import Link from 'next/link';
import type { Project } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { achievementRate, daysLeft, formatYen } from '@/lib/utils';
import { PROJECT_STATUS_LABEL } from '@/lib/constants';

const toneByStatus = {
  DRAFT: 'gray',
  ACTIVE: 'green',
  SUCCEEDED: 'amber',
  CLOSED: 'gray',
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const hasGoal = project.goalAmount !== null && project.goalAmount > 0;
  const rate = hasGoal ? achievementRate(project.currentAmount, project.goalAmount ?? 0) : 0;
  const remaining = project.endDate ? daysLeft(project.endDate) : null;

  return (
    <article className="group h-full rounded-lg border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/crowdfunding/${project.id}`} className="flex h-full flex-col p-5">
        <div className="mb-3">
          <Badge tone={toneByStatus[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-kampo-900 group-hover:text-kampo-700">
          {project.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
          {project.summary}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-kampo-800">
              {formatYen(project.currentAmount)}
            </span>
            {hasGoal && <span className="text-sm font-semibold text-sand-700">{rate}%</span>}
          </div>

          {hasGoal ? (
            <ProgressBar rate={rate} />
          ) : (
            <p className="text-xs text-gray-500">目標金額は設定していません</p>
          )}

          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <dt className="text-gray-500">目標</dt>
              <dd className="font-medium">
                {hasGoal ? formatYen(project.goalAmount ?? 0) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">支援者</dt>
              <dd className="font-medium">{project.supporterCount}人</dd>
            </div>
            <div>
              <dt className="text-gray-500">残り</dt>
              <dd className="font-medium">
                {project.status === 'ACTIVE' && remaining !== null ? `${remaining}日` : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </Link>
    </article>
  );
}
