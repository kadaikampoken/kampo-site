import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-guard';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { TimelineForm } from '@/components/admin/timeline-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { updateTimelineAction, deleteTimelineAction } from '@/app/actions/timeline';
import { truncate, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: '年表の編集' };

type Params = Promise<{ id: string }>;

export default async function EditTimelinePage({ params }: { params: Params }) {
  // 管理者専用ページ（サポーターはアクセス不可）
  await requireAdmin();

  const { id } = await params;
  const entry = await prisma.timelineEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  const action = updateTimelineAction.bind(null, entry.id);

  return (
    <div>
      <PageHeader
        title="年表の編集"
        description={`最終更新: ${formatDateTime(entry.updatedAt)}`}
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: '年表管理', href: '/admin/history' },
          { label: truncate(entry.title, 20) },
        ]}
      />

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <TimelineForm
          action={action}
          submitLabel="変更を保存"
          defaultValues={{
            year: String(entry.year),
            month: entry.month === null ? '' : String(entry.month),
            title: entry.title,
            summary: entry.summary,
            body: entry.body,
            coverImage: entry.coverImage ?? '',
            published: entry.published,
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-bold text-red-900">この項目を削除</h2>
        <div className="mt-3">
          <DeleteButton
            action={deleteTimelineAction}
            hiddenFields={{ id: entry.id }}
            label="年表エントリを削除する"
            confirmMessage={`「${entry.title}」を削除します。よろしいですか？`}
          />
        </div>
      </div>
    </div>
  );
}
