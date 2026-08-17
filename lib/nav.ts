/**
 * lib/nav.ts
 * サイト共通のナビゲーション定義
 */
export type NavItem = { href: string; label: string };

export const MAIN_NAV: NavItem[] = [
  { href: '/news', label: '広報' },
  { href: '/events', label: 'イベント' },
  { href: '/crowdfunding', label: 'クラウドファンディング' },
  { href: '/history', label: '年表' },
];

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/news', label: '広報管理' },
  { href: '/admin/crowdfunding', label: 'CF管理' },
  { href: '/admin/events', label: 'イベント管理' },
  { href: '/admin/participants', label: '参加者管理' },
  { href: '/admin/history', label: '年表管理' },
  { href: '/admin/users', label: 'ユーザー管理' },
];
