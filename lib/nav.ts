/**
 * lib/nav.ts
 * サイト共通のナビゲーション定義
 */
import type { Role } from '@prisma/client';

export type NavItem = { href: string; label: string };
/** adminOnly = true の項目はサポーターには表示しない */
export type AdminNavItem = NavItem & { adminOnly?: boolean };

export const MAIN_NAV: NavItem[] = [
  { href: '/news', label: '広報' },
  { href: '/events', label: 'イベント' },
  { href: '/crowdfunding', label: 'クラウドファンディング' },
  { href: '/history', label: '年表' },
];

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/events', label: 'イベント管理' },
  { href: '/admin/site', label: 'トップページ設定', adminOnly: true },
  { href: '/admin/news', label: '広報管理', adminOnly: true },
  { href: '/admin/crowdfunding', label: 'CF管理', adminOnly: true },
  { href: '/admin/donations', label: '支援報告', adminOnly: true },
  { href: '/admin/monthly', label: '月次集計', adminOnly: true },
  { href: '/admin/bank-account', label: '振込先設定', adminOnly: true },
  { href: '/admin/participants', label: '参加者管理', adminOnly: true },
  { href: '/admin/history', label: '年表管理', adminOnly: true },
  { href: '/admin/users', label: 'ユーザー管理', adminOnly: true },
];

/** 権限に応じて表示する管理メニューを絞り込む */
export function adminNavFor(role: Role): AdminNavItem[] {
  if (role === 'ADMIN') return ADMIN_NAV;
  return ADMIN_NAV.filter((item) => !item.adminOnly);
}
