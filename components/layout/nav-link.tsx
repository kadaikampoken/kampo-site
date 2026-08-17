'use client';

/**
 * components/layout/nav-link.tsx
 * 現在地をハイライトするナビリンク
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative px-1 py-2 text-sm transition-colors',
        active
          ? 'font-semibold text-kampo-800 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-kampo-600'
          : 'text-gray-600 hover:text-kampo-800'
      )}
    >
      {children}
    </Link>
  );
}
