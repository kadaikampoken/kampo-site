import { PageHeader } from '@/components/common/page-header';
import { TimelineForm } from '@/components/admin/timeline-form';
import { createTimelineAction } from '@/app/actions/timeline';

export const metadata = { title: '年表の新規作成' };

export default function NewTimelinePage() {
  return (
    <div>
      <PageHeader
        title="年表の新規作成"
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: '年表管理', href: '/admin/history' },
          { label: '新規作成' },
        ]}
      />
      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <TimelineForm action={createTimelineAction} submitLabel="この内容で作成" />
      </div>
    </div>
  );
}
