'use client';

/**
 * components/layout/mobile-nav.tsx
 * モバイル用ハンバーガーメニュー（項目44：レスポンシブ対応）
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function MobileNav({
  items,
  isLoggedIn,
  isAdmin,
  userName,
  signOutAction,
}: {
  items: NavItem[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移したら閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-kampo-800 hover:bg-kampo-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 z-40 border-b border-sand-200 bg-white shadow-lg"
        >
          <nav className="mx-auto max-w-content px-4 py-3">
            <ul className="divide-y divide-sand-100">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block py-3 text-base',
                      pathname.startsWith(item.href)
                        ? 'font-semibold text-kampo-800'
                        : 'text-gray-700'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link href="/admin" className="block py-3 text-base font-semibold text-sand-700">
                    管理画面
                  </Link>
                </li>
              )}
            </ul>

            <div className="mt-3 border-t border-sand-200 pt-3">
              {isLoggedIn ? (
                <div className="flex items-center justify-between gap-3">
                  <Link href="/mypage" className="text-sm font-medium text-kampo-800">
                    {userName ?? 'マイページ'}
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="rounded-md border border-sand-300 px-3 py-1.5 text-sm text-gray-700"
                    >
                      ログアウト
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-md border border-kampo-300 px-3 py-2 text-center text-sm text-kampo-800"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-md bg-kampo-700 px-3 py-2 text-center text-sm text-white"
                  >
                    会員登録
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
