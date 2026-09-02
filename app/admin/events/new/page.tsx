import { requireStaff, isAdmin } from '@/lib/auth-guard';
import { PageHeader } from '@/components/common/page-header';
import { EventForm } from '@/components/admin/event-form';
import { createEventAction } from '@/app/actions/events';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'イベントの新規作成' };

export default async function NewEventPage() {
  const user = await requireStaff('/admin/events/new');

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

      {!isAdmin(user.role) && (
        <p className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          作成したイベントは、あなた自身であとから編集・削除できます。
        </p>
      )}

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <EventForm action={createEventAction} submitLabel="この内容で作成" />
      </div>
    </div>
  );
}
