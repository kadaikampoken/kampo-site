import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EventForm } from '@/components/admin/event-form';
import { DeleteButton } from '@/components/admin/delete-button';
import { updateEventAction, deleteEventAction } from '@/app/actions/events';
import { toDateTimeLocalValue, truncate, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'イベントの編集' };

type Params = Promise<{ id: string }>;

export default async function EditEventPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { attendances: true } } },
  });
  if (!event) notFound();

  const action = updateEventAction.bind(null, event.id);

  return (
    <div>
      <PageHeader
        title="イベントの編集"
        description={`最終更新: ${formatDateTime(event.updatedAt)}`}
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: 'イベント管理', href: '/admin/events' },
          { label: truncate(event.title, 20) },
        ]}
        action={
          <Link
            href={`/admin/participants?eventId=${event.id}`}
            className="text-sm text-kampo-700 underline hover:text-kampo-900"
          >
            参加者一覧（{event._count.attendances}件）
          </Link>
        }
      />

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <EventForm
          action={action}
          submitLabel="変更を保存"
          defaultValues={{
            title: event.title,
            summary: event.summary,
            description: event.description,
            coverImage: event.coverImage ?? '',
            location: event.location,
            startsAt: toDateTimeLocalValue(event.startsAt),
            endsAt: toDateTimeLocalValue(event.endsAt),
            capacity: event.capacity === null ? '' : String(event.capacity),
            deadline: toDateTimeLocalValue(event.deadline),
            published: event.published,
            publishAt: toDateTimeLocalValue(event.publishAt),
          }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-bold text-red-900">このイベントを削除</h2>
        <p className="mt-1 text-xs text-red-800">
          参加登録（{event._count.attendances}件）も同時に削除されます。
        </p>
        <div className="mt-3">
          <DeleteButton
            action={deleteEventAction}
            hiddenFields={{ id: event.id }}
            label="イベントを削除する"
            confirmMessage={`「${event.title}」を削除します。参加登録もすべて削除されます。よろしいですか？`}
          />
        </div>
      </div>
    </div>
  );
}
