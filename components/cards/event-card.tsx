/**
 * components/cards/event-card.tsx
 */
import Link from 'next/link';
import type { Event } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

export function EventCard({
  event,
  attendingCount,
  myStatus,
}: {
  event: Event;
  attendingCount?: number;
  myStatus?: 'ATTENDING' | 'NOT_ATTENDING' | null;
}) {
  const isPast = new Date(event.startsAt) < new Date();
  const isFull =
    event.capacity !== null && attendingCount !== undefined && attendingCount >= event.capacity;

  return (
    <article className="group h-full rounded-lg border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/events/${event.id}`} className="flex h-full flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isPast ? (
            <Badge tone="gray">終了</Badge>
          ) : isFull ? (
            <Badge tone="red">満員</Badge>
          ) : (
            <Badge tone="green">受付中</Badge>
          )}
          {myStatus === 'ATTENDING' && <Badge tone="blue">参加登録済み</Badge>}
          {myStatus === 'NOT_ATTENDING' && <Badge tone="gray">不参加</Badge>}
        </div>

        <h3 className="mb-2 text-lg font-semibold leading-snug text-kampo-900 group-hover:text-kampo-700">
          {event.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">{event.summary}</p>

        <dl className="mt-4 space-y-1.5 text-sm text-gray-700">
          <div className="flex gap-2">
            <dt className="shrink-0 text-gray-500">日時</dt>
            <dd>
              <time dateTime={event.startsAt.toISOString()}>{formatDateTime(event.startsAt)}</time>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-gray-500">場所</dt>
            <dd className="truncate">{event.location}</dd>
          </div>
          {event.capacity !== null && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-gray-500">定員</dt>
              <dd>
                {attendingCount ?? 0} / {event.capacity} 人
              </dd>
            </div>
          )}
        </dl>
      </Link>
    </article>
  );
}
