import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { ProjectForm } from '@/components/admin/project-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { updateProjectAction, deleteProjectAction } from '@/app/actions/crowdfunding';
import { toDateValue, toDateTimeLocalValue, truncate, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'プロジェクトの編集' };

type Params = Promise<{ id: string }>;

export default async function EditProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const action = updateProjectAction.bind(null, project.id);

  return (
    <div>
      <PageHeader
        title="プロジェクトの編集"
        description={`最終更新: ${formatDateTime(project.updatedAt)}`}
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: 'CF管理', href: '/admin/crowdfunding' },
          { label: truncate(project.title, 20) },
        ]}
      />

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <ProjectForm
          action={action}
          submitLabel="変更を保存"
          defaultValues={{
            title: project.title,
            summary: project.summary,
            description: project.description,
            purpose: project.purpose ?? '',
            fundUsage: project.fundUsage ?? '',
            coverImage: project.coverImage ?? '',
            goalAmount: project.goalAmount === null ? '' : String(project.goalAmount),
            currentAmount: String(project.currentAmount),
            supporterCount: String(project.supporterCount),
            status: project.status,
            startDate: toDateValue(project.startDate),
            endDate: toDateValue(project.endDate),
            externalUrl: project.externalUrl ?? '',
            publishAt: toDateTimeLocalValue(project.publishAt),
            acceptingSupport: project.acceptingSupport,
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-bold text-red-900">このプロジェクトを削除</h2>
        <p className="mt-1 text-xs text-red-800">削除すると元に戻せません。</p>
        <div className="mt-3">
          <DeleteButton
            action={deleteProjectAction}
            hiddenFields={{ id: project.id }}
            label="プロジェクトを削除する"
            confirmMessage={`「${project.title}」を削除します。よろしいですか？`}
          />
        </div>
      </div>
    </div>
  );
}
