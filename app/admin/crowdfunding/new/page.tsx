import { PageHeader } from '@/components/common/page-header';
import { requireAdmin } from '@/lib/auth-guard';
import { ProjectForm } from '@/components/admin/project-form';
import { createProjectAction } from '@/app/actions/crowdfunding';

export const metadata = { title: 'プロジェクトの新規作成' };

export default async function NewProjectPage() {
  // 管理者専用ページ（サポーターはアクセス不可）
  await requireAdmin();

  return (
    <div>
      <PageHeader
        title="プロジェクトの新規作成"
        breadcrumbs={[
          { label: '管理画面', href: '/admin' },
          { label: 'CF管理', href: '/admin/crowdfunding' },
          { label: '新規作成' },
        ]}
      />
      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <ProjectForm action={createProjectAction} submitLabel="この内容で作成" />
      </div>
    </div>
  );
}
