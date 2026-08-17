/**
 * app/admin/news/new/page.tsx
 */
import { PageHeader } from '@/components/common/page-header';
import { NewsForm } from '@/components/admin/news-form';
import { createNewsAction } from '@/app/actions/news';

export const metadata = { title: '広報の新規作成' };

export default function NewNewsPage() {
  return (
    <div>
      <PageHeader
        title="広報の新規作成"
        breadcrumbs={[{ label: '管理画面', href: '/admin' }, { label: '広報管理', href: '/admin/news' }, { label: '新規作成' }]}
      />
      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <NewsForm action={createNewsAction} submitLabel="この内容で作成" />
      </div>
    </div>
  );
}
