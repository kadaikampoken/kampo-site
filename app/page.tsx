/**
 * app/page.tsx  （項目24：ホーム）
 */
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { LinkButton } from '@/components/ui/button';
import { SectionHeading } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { NewsCard } from '@/components/cards/news-card';
import { ProjectCard } from '@/components/cards/project-card';
import { EventCard } from '@/components/cards/event-card';
import { formatDate, formatDateTime } from '@/lib/utils';
import { SITE_DESCRIPTION, SITE_STATS } from '@/lib/constants';
import {
  visibleNewsWhere,
  visibleEventWhere,
  visibleProjectWhere,
} from '@/lib/visibility';

export const dynamic = 'force-dynamic';

const ACTIVITIES = [
  {
    title: '定例勉強会',
    body: '月2回、方剤や病態をテーマに学生同士で学び合います。予備知識は不要です。',
    icon: '📖',
  },
  {
    title: '生薬見学会',
    body: '実物の生薬に触れ、香り・形状・味から鑑別を学ぶ実習を年2回開催しています。',
    icon: '🌿',
  },
  {
    title: '地域健康講座',
    body: '「未病」「養生」の考え方を、地域の皆さまへ学生の言葉でお届けしています。',
    icon: '🏘️',
  },
  {
    title: '会誌の発行',
    body: '年1回、会員の研究報告や症例検討をまとめた会誌『薩摩漢方』を発行しています。',
    icon: '📗',
  },
];

export default async function HomePage() {
  const now = new Date();

  const [news, projects, events, timeline, registeredUserCount] = await Promise.all([
    prisma.news.findMany({
      where: visibleNewsWhere(now),
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.project.findMany({
      where: { ...visibleProjectWhere(now), status: { in: ['ACTIVE', 'SUCCEEDED'] } },
      orderBy: [{ status: 'asc' }, { endDate: 'desc' }],
      take: 2,
    }),
    prisma.event.findMany({
      where: { ...visibleEventWhere(now), startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 3,
      include: { _count: { select: { attendances: { where: { status: 'ATTENDING' } } } } },
    }),
    prisma.timelineEntry.findMany({
      where: { published: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 3,
    }),
    prisma.user.count(),
  ]);

  // --- トップページの数値（lib/constants.ts の SITE_STATS で調整） ---
  const memberCount = SITE_STATS.memberCount ?? registeredUserCount;
  const activeYears = Math.max(1, new Date().getFullYear() - SITE_STATS.foundedYear);

  // 直近の開催予定（次回の部会）
  const nextEvent = events[0] ?? null;

  return (
    <>
      {/* ============ ヒーロー ============ */}
      <section className="washi border-b border-sand-200">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center rounded-full bg-kampo-100 px-3 py-1 text-xs font-medium text-kampo-800">
              鹿児島大学 公認学生団体
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-kampo-900 sm:text-5xl">
              漢方医学を、
              <br />
              学生の手で学ぶ。
            </h1>
            <p className="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg">
              {SITE_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/events" size="lg">
                イベントを見る
              </LinkButton>
              <LinkButton href="/register" variant="outline" size="lg">
                入会・会員登録
              </LinkButton>
            </div>

            <dl className="mt-12 grid max-w-xs grid-cols-2 gap-6">
              <div>
                <dt className="text-xs text-gray-600">会員数</dt>
                <dd className="text-2xl font-bold text-kampo-800">{memberCount}名</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-600">活動年数</dt>
                <dd className="text-2xl font-bold text-kampo-800">{activeYears}年</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ============ 次回の部会 ============ */}
      {nextEvent && (
        <section className="bg-kampo-800 text-white">
          <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full bg-kampo-700 px-3 py-1 text-xs font-medium text-sand-100">
                  <span aria-hidden="true">📅</span> 次回の部会
                </p>
                <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
                  {nextEvent.title}
                </h2>
                <dl className="mt-4 flex flex-col gap-2 text-sm text-sand-100 sm:flex-row sm:flex-wrap sm:gap-x-8">
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-sand-300">日時</dt>
                    <dd>
                      <time dateTime={nextEvent.startsAt.toISOString()}>
                        {formatDateTime(nextEvent.startsAt)}
                      </time>
                      {nextEvent.endsAt && (
                        <> 〜 {formatDateTime(nextEvent.endsAt).split(' ')[1]}</>
                      )}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-sand-300">場所</dt>
                    <dd>{nextEvent.location}</dd>
                  </div>
                  {nextEvent.capacity !== null && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-sand-300">参加予定</dt>
                      <dd>
                        {nextEvent._count.attendances} / {nextEvent.capacity} 名
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="shrink-0">
                <LinkButton href={`/events/${nextEvent.id}`} variant="secondary" size="lg">
                  詳細・参加登録
                </LinkButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 活動紹介 ============ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <SectionHeading title="わたしたちの活動" subtitle="学部・学年を問わず参加できます" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITIES.map((a) => (
            <li key={a.title} className="rounded-lg border border-sand-200 bg-white p-5">
              <p className="text-2xl" aria-hidden="true">
                {a.icon}
              </p>
              <h3 className="mt-3 font-semibold text-kampo-900">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{a.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ 今後のイベント ============ */}
      <section className="border-y border-sand-200 bg-white">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <SectionHeading
            title="今後のイベント"
            subtitle="参加登録はイベント詳細ページから行えます"
            href="/events"
          />
          {events.length === 0 ? (
            <EmptyState
              title="予定されているイベントはありません"
              description="次回の開催が決まり次第、こちらでお知らせします。"
              actionLabel="過去のイベントを見る"
              actionHref="/events?filter=past"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} attendingCount={e._count.attendances} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ 広報 ============ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <SectionHeading title="広報・お知らせ" subtitle="活動報告やメディア掲載情報" href="/news" />
        {news.length === 0 ? (
          <EmptyState title="お知らせはまだありません" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        )}
      </section>

      {/* ============ クラウドファンディング ============ */}
      {projects.length > 0 && (
        <section className="border-y border-sand-200 bg-white">
          <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
            <SectionHeading
              title="クラウドファンディング"
              subtitle="活動へのご支援をお願いしています"
              href="/crowdfunding"
            />
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 年表プレビュー ============ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <SectionHeading title="会のあゆみ" subtitle="発足から現在まで" href="/history" />
        <ol className="relative border-l-2 border-kampo-200 pl-6">
          {timeline.map((t) => (
            <li key={t.id} className="relative pb-8 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-kampo-600"
              />
              <p className="text-sm font-semibold text-sand-700">
                {t.year}年{t.month ? `${t.month}月` : ''}
              </p>
              <h3 className="mt-1 font-semibold text-kampo-900">
                <Link href={`/history/${t.id}`} className="hover:underline">
                  {t.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-kampo-800">
        <div className="mx-auto max-w-content px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">見学・入会をお待ちしています</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-100">
            漢方の知識は必要ありません。「なんとなく面白そう」という気持ちだけで十分です。
            まずは勉強会の見学からどうぞ。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/register" variant="secondary" size="lg">
              会員登録する
            </LinkButton>
            <LinkButton
              href="/events"
              size="lg"
              className="border border-sand-200 bg-transparent text-white hover:bg-kampo-700"
            >
              イベントを探す
            </LinkButton>
          </div>
          <p className="mt-6 text-xs text-sand-300">
            最終更新: {formatDate(new Date())}
          </p>
        </div>
      </section>
    </>
  );
}
