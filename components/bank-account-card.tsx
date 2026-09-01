/**
 * components/bank-account-card.tsx
 * 振込先口座の表示とコピー機能。
 * 銀行アプリへの直接連携は行わず、どの金融機関からでも振込できる方式にしている。
 */
import { CopyButton } from '@/components/copy-button';
import type { BankAccountInfo } from '@/lib/bank';
import { formatBankAccountText } from '@/lib/bank';

export function BankAccountCard({ account }: { account: BankAccountInfo }) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: '金融機関名', value: account.bankName },
    { label: '支店名', value: `${account.branchName}（支店コード ${account.branchCode}）` },
    { label: '口座種別', value: account.accountType },
    { label: '口座番号', value: account.accountNumber, mono: true },
    { label: '口座名義', value: account.accountHolder },
  ];

  if (account.accountHolderKana) {
    rows.push({ label: '口座名義（カナ）', value: account.accountHolderKana });
  }

  return (
    <div className="rounded-lg border-2 border-kampo-300 bg-white p-5 sm:p-6">
      <h3 className="text-base font-bold text-kampo-900">お振込先</h3>

      <dl className="mt-4 divide-y divide-sand-200 rounded-md border border-sand-200">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="shrink-0 text-xs text-gray-500 sm:w-32 sm:pt-0.5 sm:text-sm">
              {row.label}
            </dt>
            <dd
              className={
                row.mono
                  ? 'select-all font-mono text-lg font-bold tracking-wider text-kampo-900'
                  : 'select-all text-sm font-medium text-gray-900'
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <CopyButton
          value={account.accountNumber}
          label="口座番号をコピー"
          copiedLabel="口座番号をコピーしました"
          variant="outline"
        />
        <CopyButton
          value={formatBankAccountText(account)}
          label="振込先情報をコピー"
          copiedLabel="振込先情報をコピーしました"
        />
      </div>

      {account.note && (
        <p className="mt-4 rounded-md bg-sand-50 px-4 py-3 text-xs leading-relaxed text-gray-700">
          {account.note}
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        ※ 当サイトでは決済を行いません。ご自身の銀行アプリ・ネットバンキング・ATM・窓口からお振込ください。
        クレジットカード情報などをお預かりすることはありません。
      </p>
    </div>
  );
}
