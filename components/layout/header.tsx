/**
 * components/layout/header.tsx  （項目19：Header）
 */
import Link from 'next/link';
import { auth } from '@/auth';
import { signOutAction } from '@/app/actions/auth';
import { MAIN_NAV, type NavItem } from '@/lib/nav';
import { SITE_NAME } from '@/lib/constants';
import { NavLink } from './nav-link';
import { MobileNav } from './mobile-nav';

export async function Header() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'ADMIN' || user?.role === 'SUPPORTER';

  // 会員一覧はログインした会員のみに見せる
  const navItems: NavItem[] = user
    ? [...MAIN_NAV, { href: '/members', label: '会員一覧' }]
    : MAIN_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        {/* ロゴ */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-kampo-700 text-base font-bold text-white"
          >
            漢
          </span>
          <span className="hidden text-sm font-bold leading-tight text-kampo-900 sm:block">
            鹿児島大学
            <br />
            漢方医学研究会
          </span>
          <span className="sr-only">{SITE_NAME}</span>
        </Link>

        {/* PC ナビ */}
        <nav aria-label="メインナビゲーション" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 右側：認証状態 */}
        <div className="hidden items-center gap-3 md:flex">
          {isStaff && (
            <Link
              href="/admin"
              className="rounded-md bg-sand-100 px-3 py-1.5 text-sm font-medium text-sand-800 hover:bg-sand-200"
            >
              管理画面
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/mypage"
                className="max-w-[10rem] truncate text-sm font-medium text-kampo-800 hover:underline"
              >
                {user.name ?? 'マイページ'}
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-sand-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-sand-50"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-kampo-800">
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-kampo-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-kampo-800"
              >
                会員登録
              </Link>
            </>
          )}
        </div>

        {/* モバイルナビ */}
        <MobileNav
          items={navItems}
          isLoggedIn={Boolean(user)}
          isAdmin={isStaff}
          userName={user?.name}
          signOutAction={signOutAction}
        />
      </div>
    </header>
  );
}
