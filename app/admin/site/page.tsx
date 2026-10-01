/**
 * app/admin/site/page.tsx
 * トップページ設定（管理者のみ）：大見出し・団体紹介文・活動紹介
 */
import Link from 'next/link';

import { PageHeader } from '@/components/common/page-header';
import { requireAdmin } from '@/lib/auth-guard';
import { SiteSettingsForm } from '@/components/admin/site-settings-form';
import {
  getSiteSettings,
  getFoundedYear,
  toFormValues,
  MAX_ACTIVITIES,
} from '@/lib/site-settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'トップページ設定' };

export default async function AdminSitePage() {
  // 管理者専用ページ（サポーターはアクセス不可）
  await requireAdmin();

  const [settings, foundedYear] = await Promise.all([getSiteSettings(), getFoundedYear()]);
  const activeYears = Math.max(1, new Date().getFullYear() - foundedYear);

  return (
    <div>
      <PageHeader
        title="トップページ設定"
        description="トップページの大見出し・団体紹介文・活動紹介を編集できます。保存するとすぐにサイトへ反映されます。"
      />

      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <SiteSettingsForm defaultValues={toFormValues(settings)} activitySlots={MAX_ACTIVITIES} />
      </div>

      <p className="mt-6 rounded-md border border-sand-200 bg-sand-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
        <strong className="text-kampo-900">活動年数について：</strong>
        年表に記載されている一番古い年（現在 {foundedYear}年）を発足年として自動で計算しています
        （現在の表示：{activeYears}年）。変えたい場合は
        <Link href="/admin/history" className="mx-1 text-kampo-700 underline">
          年表管理
        </Link>
        で年表を編集してください。会員数は登録アカウント数から自動で集計されます。
      </p>
    </div>
  );
}
