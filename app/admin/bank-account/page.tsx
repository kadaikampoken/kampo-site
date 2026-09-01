/**
 * app/admin/bank-account/page.tsx
 * 振込先口座の設定（管理者のみ）
 */
import { PageHeader } from '@/components/common/page-header';
import { BankAccountForm } from '@/components/admin/bank-account-form';
import { BankAccountCard } from '@/components/bank-account-card';
import { getBankAccount } from '@/lib/bank';

export const dynamic = 'force-dynamic';
export const metadata = { title: '振込先設定' };

export default async function AdminBankAccountPage() {
  const account = await getBankAccount();

  return (
    <div>
      <PageHeader
        title="振込先設定"
        description="支援ページに表示される振込先口座の情報です。変更するとすべての支援ページに即時反映されます。"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border border-sand-200 bg-white p-6">
          <BankAccountForm defaultValues={account} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-medium text-kampo-900">支援ページでの表示（プレビュー）</p>
          <BankAccountCard account={account} />
        </aside>
      </div>

      <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        口座情報は一般公開ページに表示されます。会の口座であることを必ず確認したうえで登録してください。
        個人名義の口座を登録すると、支援者に不信感を与えるおそれがあります。
      </p>
    </div>
  );
}
