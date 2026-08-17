/**
 * components/cards/news-card.tsx
 */
import Link from 'next/link';
import type { News } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { NEWS_CATEGORY_LABEL } from '@/lib/constants';

const toneByCategory = {
  ANNOUNCEMENT: 'default',
  REPORT: 'green',
  MEDIA: 'blue',
  RECRUIT: 'sand',
} as const;

export function NewsCard({ news }: { news: News }) {
  return (
    <article className="group h-full rounded-lg border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/news/${news.id}`} className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <Badge tone={toneByCategory[news.category]}>
            {NEWS_CATEGORY_LABEL[news.category]}
          </Badge>
          <time dateTime={(news.publishedAt ?? news.createdAt).toISOString()} className="text-xs text-gray-500">
            {formatDate(news.publishedAt ?? news.createdAt)}
          </time>
        </div>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-kampo-900 group-hover:text-kampo-700">
          {news.title}
        </h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{news.excerpt}</p>
        <span className="mt-4 text-sm font-medium text-kampo-700">続きを読む →</span>
      </Link>
    </article>
  );
}
