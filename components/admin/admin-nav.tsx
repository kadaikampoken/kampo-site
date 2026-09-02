'use client';

/**
 * components/admin/admin-nav.tsx
 * 権限に応じて表示するメニューを切り替える（サポーターにはイベント管理のみ）
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@prisma/client';

import { adminNavFor } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = adminNavFor(role);

  return (
    <nav aria-label="管理メニュー" className="overflow-x-auto">
      <ul className="flex gap-1 border-b border-sand-200 md:flex-col md:gap-0.5 md:border-b-0">
        {items.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap rounded-md px-4 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-kampo-700 font-semibold text-white'
                    : 'text-gray-700 hover:bg-kampo-50'
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
