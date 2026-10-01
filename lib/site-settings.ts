/**
 * lib/site-settings.ts
 * トップページの文言のうち、管理画面「トップページ設定」から編集できるもの。
 *   - 大見出し
 *   - 団体紹介文
 *   - 活動紹介（カード）
 *
 * - DB の site_settings テーブル（1件のみ、id は常に "default"）に JSON で保存します。
 * - 未保存の場合や、テーブルがまだ無い場合は DEFAULT_SITE_SETTINGS を表示します。
 *   （マイグレーション適用前でもサイトが止まらないようにするため）
 */
import { cache } from 'react';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { SITE_DESCRIPTION, SITE_STATS } from '@/lib/constants';

export const SITE_SETTINGS_ID = 'default';

/** 活動紹介カードの最大数 */
export const MAX_ACTIVITIES = 6;

export type Activity = { icon: string; title: string; body: string };

export type SiteSettings = {
  /** 大見出し（改行がそのまま表示されます） */
  heroTitle: string;
  /** 団体紹介文（大見出しの下。検索結果などに出る説明文にも使われます） */
  description: string;
  /** 活動紹介のカード */
  activities: Activity[];
};

/** 初期値（これまでサイトに書かれていた文言） */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTitle: '漢方医学を、\n学生の手で学ぶ。',
  description: SITE_DESCRIPTION,
  activities: [
    {
      icon: '📖',
      title: '定例勉強会',
      body: '月2回、方剤や病態をテーマに学生同士で学び合います。予備知識は不要です。',
    },
    {
      icon: '🌿',
      title: '生薬見学会',
      body: '実物の生薬に触れ、香り・形状・味から鑑別を学ぶ実習を年2回開催しています。',
    },
    {
      icon: '🏘️',
      title: '地域健康講座',
      body: '「未病」「養生」の考え方を、地域の皆さまへ学生の言葉でお届けしています。',
    },
    {
      icon: '📗',
      title: '会誌の発行',
      body: '年1回、会員の研究報告や症例検討をまとめた会誌『薩摩漢方』を発行しています。',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 取得                                                                */
/* ------------------------------------------------------------------ */

/** 保存済みの値を既定値に重ねる（項目が欠けていても既定値で補う） */
function mergeWithDefaults(stored: unknown): SiteSettings {
  const d = DEFAULT_SITE_SETTINGS;
  if (!stored || typeof stored !== 'object') return d;
  const s = stored as Record<string, unknown>;
  const str = (v: unknown, def: string) => (typeof v === 'string' && v.trim() ? v : def);

  return {
    heroTitle: str(s.heroTitle, d.heroTitle),
    description: str(s.description, d.description),
    activities: Array.isArray(s.activities)
      ? s.activities
          .filter(
            (a): a is Activity =>
              Boolean(a) && typeof a === 'object' && typeof (a as Activity).title === 'string'
          )
          .map((a) => ({
            icon: typeof a.icon === 'string' ? a.icon : '',
            title: a.title,
            body: typeof a.body === 'string' ? a.body : '',
          }))
          .slice(0, MAX_ACTIVITIES)
      : d.activities,
  };
}

/**
 * 現在のトップページ設定を取得する。
 * 1回の表示の中で何度呼んでも、DBへの問い合わせは1回だけです。
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const record = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
    return mergeWithDefaults(record?.content);
  } catch (error) {
    // テーブル未作成（マイグレーション未適用）などの場合は既定値で表示を続ける
    console.error('[site-settings] 設定の読み込みに失敗したため既定値を使用します', error);
    return DEFAULT_SITE_SETTINGS;
  }
});

/**
 * 発足年 = 年表（公開中）に記載されている一番古い年。
 * 年表が空のときは lib/constants.ts の SITE_STATS.foundedYear を使います。
 */
export async function getFoundedYear(): Promise<number> {
  const oldest = await prisma.timelineEntry.findFirst({
    where: { published: true },
    orderBy: [{ year: 'asc' }],
    select: { year: true },
  });
  return oldest?.year ?? SITE_STATS.foundedYear;
}

/* ------------------------------------------------------------------ */
/* フォーム ⇔ 設定 の変換                                              */
/* ------------------------------------------------------------------ */

/** フォームの入力欄の名前と値（すべて文字列） */
export type SiteSettingsFormValues = Record<string, string>;

/** 設定 → フォームの初期値 */
export function toFormValues(s: SiteSettings): SiteSettingsFormValues {
  const v: SiteSettingsFormValues = {
    heroTitle: s.heroTitle,
    description: s.description,
  };
  for (let i = 0; i < MAX_ACTIVITIES; i++) {
    const a = s.activities[i];
    v[`activity${i}Icon`] = a?.icon ?? '';
    v[`activity${i}Title`] = a?.title ?? '';
    v[`activity${i}Body`] = a?.body ?? '';
  }
  return v;
}

const limited = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: `${label}は${max}文字以内で入力してください` })
    .optional()
    .default('');

const activityFields: Record<string, z.ZodType<string, z.ZodTypeDef, unknown>> = {};
for (let i = 0; i < MAX_ACTIVITIES; i++) {
  activityFields[`activity${i}Icon`] = limited('アイコン', 8);
  activityFields[`activity${i}Title`] = limited('タイトル', 40);
  activityFields[`activity${i}Body`] = limited('説明文', 200);
}

/** 管理画面フォームの入力チェック */
export const siteSettingsFormSchema = z
  .object({
    heroTitle: limited('大見出し', 80).refine((v) => v.length > 0, {
      message: '大見出しを入力してください',
    }),
    description: limited('団体紹介文', 400).refine((v) => v.length > 0, {
      message: '団体紹介文を入力してください',
    }),
  })
  .extend(activityFields)
  .superRefine((v, ctx) => {
    const values = v as Record<string, string>;
    let count = 0;
    for (let i = 0; i < MAX_ACTIVITIES; i++) {
      const title = values[`activity${i}Title`];
      const body = values[`activity${i}Body`];
      if (title) count++;
      // タイトルが空のカードは非表示。説明文だけ入っている場合は入力漏れとして知らせる
      if (!title && body) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`activity${i}Title`],
          message: 'タイトルを入力してください（カードを消す場合は説明文も空にします）',
        });
      }
    }
    if (count === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['activity0Title'],
        message: '活動紹介は1つ以上入力してください',
      });
    }
  });

/** チェック済みの入力 → 保存する設定 */
export function fromFormInput(input: z.infer<typeof siteSettingsFormSchema>): SiteSettings {
  const v = input as Record<string, string>;
  const activities: Activity[] = [];
  for (let i = 0; i < MAX_ACTIVITIES; i++) {
    const title = v[`activity${i}Title`];
    if (!title) continue;
    activities.push({ icon: v[`activity${i}Icon`], title, body: v[`activity${i}Body`] });
  }
  return { heroTitle: v.heroTitle, description: v.description, activities };
}
