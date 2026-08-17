import { PageHeader } from '@/components/common/page-header';
import { EventForm } from '@/components/admin/event-form';
import { createEventAction } from '@/app/actions/events';

export const metadata = { title: 'イベントの新規作成' };

export default function NewEventPage() {
  return (
    <div>
      <PageHeader
        title="イベントの新規作成"
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: 'イベント管理', href: '/admin/events' },
          { label: '新規作成' },
        ]}
      />
      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <EventForm action={createEventAction} submitLabel="この内容で作成" />
      </div>
    </div>
  );
}
