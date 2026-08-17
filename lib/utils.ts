/**
 * lib/utils.ts
 * 汎用ユーティリティ
 */

/** className を条件付きで連結する（clsx の最小実装） */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const JST = 'Asia/Tokyo';

/** 2026年8月16日 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: JST,
  }).format(new Date(date));
}

/** 2026/08/16 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: JST,
  }).format(new Date(date));
}

/** 2026年8月16日(日) 18:30 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const base = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: JST,
  }).format(d);
  const time = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JST,
  }).format(d);
  return `${base} ${time}`;
}

/** <input type="datetime-local"> 用の値（JST基準） */
export function toDateTimeLocalValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JST,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** <input type="date"> 用の値（JST基準） */
export function toDateValue(date: Date | string | null | undefined): string {
  return toDateTimeLocalValue(date).slice(0, 10);
}

/** ¥1,500,000 */
export function formatYen(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 達成率(%) 0-999 に丸める */
export function achievementRate(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(999, Math.round((current / goal) * 100));
}

/** 残り日数（負なら 0） */
export function daysLeft(endDate: Date | string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

/** 本文を段落配列に分割（空行区切り） */
export function toParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** 文字列を指定長で丸める */
export function truncate(text: string, length = 80): string {
  return text.length <= length ? text : `${text.slice(0, length)}…`;
}
