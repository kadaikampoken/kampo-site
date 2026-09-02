/**
 * app/admin/layout.tsx
 * 管理画面共通レイアウト。
 * requireStaff() で管理者・サポーターのみを通し、
 * 管理者専用ページは各ページ側でさらに requireAdmin() を行う（多層防御）。
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { requireStaff } from '@/lib/auth-guard';
import { AdminNav } from '@/components/admin/admin-nav';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABEL, ROLE_TONE } from '@/lib/constants';

export const metadata: Metadata = {
  title: { default: '管理画面', template: '%s | 管理画面' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sand-300 bg-sand-100 px-5 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-sand-900">
            管理画面
            <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
          </p>
          <p className="text-xs text-sand-700">
            {user.name}（{user.email}）としてログイン中
          </p>
        </div>
        <Link href="/" className="text-sm text-kampo-800 underline hover:text-kampo-900">
          サイトを表示 →
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[13rem_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <AdminNav role={user.role} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
