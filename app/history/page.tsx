/**
 * app/history/page.tsx  （項目32：年表）
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '年表 — 会のあゆみ',
  description: '鹿児島大学漢方医学研究会の発足から現在までのあゆみを年表形式で紹介します。',
};

export default async function HistoryPage() {
  const entries = await prisma.timelineEntry.findMany({
    where: { published: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  // 年ごとにグルーピング
  const byYear = new Map<number, typeof entries>();
  for (const e of entries) {
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        title="会のあゆみ"
        description="有志7名の勉強会として発足してから現在までの歩みです。"
        breadcrumbs={[{ label: '年表' }]}
      />

      {entries.length === 0 ? (
        <EmptyState title="年表データがまだありません" />
      ) : (
        <div className="space-y-12">
          {Array.from(byYear.entries()).map(([year, items]) => (
            <section key={year}>
              <h2 className="sticky top-16 z-10 -mx-4 bg-sand-50/95 px-4 py-2 text-xl font-bold text-sand-700 backdrop-blur sm:-mx-6 sm:px-6">
                {year}年
              </h2>
              <ol className="relative mt-4 border-l-2 border-kampo-200 pl-8">
                {items.map((e) => (
                  <li key={e.id} className="relative pb-10 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.35rem] top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-kampo-600"
                    />
                    <article className="rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-md">
                      {e.month && (
                        <p className="text-sm font-semibold text-kampo-600">{e.month}月</p>
                      )}
                      <h3 className="mt-1 text-lg font-semibold text-kampo-900">
                        <Link href={`/history/${e.id}`} className="hover:underline">
                          {e.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{e.summary}</p>
                      <Link
                        href={`/history/${e.id}`}
                        className="mt-3 inline-block text-sm font-medium text-kampo-700 hover:underline"
                      >
                        詳しく見る →
                      </Link>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
