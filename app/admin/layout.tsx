/**
 * app/admin/layout.tsx
 * 管理画面共通レイアウト。ここでも requireAdmin() を呼び、
 * middleware をすり抜けた場合でもアクセスを遮断する（多層防御・項目47）。
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { requireAdmin } from '@/lib/auth-guard';
import { AdminNav } from '@/components/admin/admin-nav';

export const metadata: Metadata = {
  title: { default: '管理画面', template: '%s | 管理画面' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sand-300 bg-sand-100 px-5 py-3">
        <div>
          <p className="text-sm font-bold text-sand-900">管理画面</p>
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
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
