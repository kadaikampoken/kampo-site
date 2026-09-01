/**
 * lib/visibility.ts
 * 「予約公開」の判定を1箇所にまとめたモジュール。
 *
 * 仕組み：
 *   cron（定期実行）で公開フラグを書き換えるのではなく、
 *   「公開開始日時が現在時刻を過ぎているか」をページ表示のたびに判定します。
 *   すべての公開ページは force-dynamic なので、指定時刻を過ぎた最初のアクセスから
 *   自動的に記事が現れます（1分・1秒単位で正確、外部サービス不要）。
 *
 *   - 広報 News    : published === true かつ publishedAt <= 現在
 *   - イベント Event: published === true かつ（publishAt が未設定 または <= 現在）
 *   - CF   Project : status !== 'DRAFT' かつ（publishAt が未設定 または <= 現在）
 */
import type { Prisma, ProjectStatus } from '@prisma/client';

/** 公開状態の3区分 */
export type PublishState = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export const PUBLISH_STATE_LABEL: Record<PublishState, string> = {
  DRAFT: '下書き',
  SCHEDULED: '予約公開',
  PUBLISHED: '公開中',
};

export const PUBLISH_STATE_TONE = {
  DRAFT: 'gray',
  SCHEDULED: 'amber',
  PUBLISHED: 'green',
} as const;

/* ------------------------------------------------------------------ */
/* 一覧取得用の where 句                                               */
/* ------------------------------------------------------------------ */

/** 一般公開されている広報だけを抽出する条件 */
export function visibleNewsWhere(now: Date = new Date()): Prisma.NewsWhereInput {
  return { published: true, publishedAt: { lte: now } };
}

/** 一般公開されているイベントだけを抽出する条件 */
export function visibleEventWhere(now: Date = new Date()): Prisma.EventWhereInput {
  return {
    published: true,
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
  };
}

/** 一般公開されているクラウドファンディング案件だけを抽出する条件 */
export function visibleProjectWhere(now: Date = new Date()): Prisma.ProjectWhereInput {
  return {
    status: { not: 'DRAFT' },
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
  };
}

/* ------------------------------------------------------------------ */
/* 単体の判定（詳細ページ用）                                          */
/* ------------------------------------------------------------------ */

export function isNewsVisible(
  news: { published: boolean; publishedAt: Date | null },
  now: Date = new Date()
): boolean {
  return news.published && news.publishedAt !== null && news.publishedAt <= now;
}

export function isEventVisible(
  event: { published: boolean; publishAt: Date | null },
  now: Date = new Date()
): boolean {
  return event.published && (event.publishAt === null || event.publishAt <= now);
}

export function isProjectVisible(
  project: { status: ProjectStatus; publishAt: Date | null },
  now: Date = new Date()
): boolean {
  return project.status !== 'DRAFT' && (project.publishAt === null || project.publishAt <= now);
}

/* ------------------------------------------------------------------ */
/* 管理画面のバッジ表示用                                              */
/* ------------------------------------------------------------------ */

export function newsState(
  news: { published: boolean; publishedAt: Date | null },
  now: Date = new Date()
): PublishState {
  if (!news.published) return 'DRAFT';
  if (news.publishedAt !== null && news.publishedAt > now) return 'SCHEDULED';
  return 'PUBLISHED';
}

export function eventState(
  event: { published: boolean; publishAt: Date | null },
  now: Date = new Date()
): PublishState {
  if (!event.published) return 'DRAFT';
  if (event.publishAt !== null && event.publishAt > now) return 'SCHEDULED';
  return 'PUBLISHED';
}

export function projectState(
  project: { status: ProjectStatus; publishAt: Date | null },
  now: Date = new Date()
): PublishState {
  if (project.status === 'DRAFT') return 'DRAFT';
  if (project.publishAt !== null && project.publishAt > now) return 'SCHEDULED';
  return 'PUBLISHED';
}
