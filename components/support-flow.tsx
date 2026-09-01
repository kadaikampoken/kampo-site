/**
 * components/support-flow.tsx
 * 支援の手順（プロジェクト選択 → 金額確認 → 振込先表示・コピー → 振込 → 報告）
 * 一般公開ページと個別プロジェクトページの両方から使う共通パーツ。
 */
import Link from 'next/link';

import { BankAccountCard } from '@/components/bank-account-card';
import { DonationForm, type DonationProjectOption } from '@/components/forms/donation-form';
import type { BankAccountInfo } from '@/lib/bank';
import { formatDate, formatYen } from '@/lib/utils';

const STEPS = [
  { title: 'プロジェクトを選ぶ', body: '支援したいプロジェクトを決めます。指定なし（会の活動全般）も選べます。' },
  { title: '支援金額を決める', body: '金額の下限・上限はありません。無理のない範囲でご検討ください。' },
  { title: '振込先をコピーする', body: '下のボタンで口座番号や振込先情報をコピーできます。' },
  { title: '銀行から振り込む', body: 'ご自身の銀行アプリ・ネットバンキング・ATM・窓口からお振込ください。' },
  { title: 'このページに戻る', body: '振込が完了したら、このページに戻ってきてください。' },
  { title: '振込完了フォームを送信', body: '入金の照合のため、フォームからご報告をお願いします。' },
];

export function SupportFlow({
  account,
  projects,
  currentProject,
}: {
  account: BankAccountInfo;
  projects: DonationProjectOption[];
  currentProject?: {
    id: string;
    title: string;
    summary: string;
    goalAmount: number | null;
    endDate: Date | null;
    acceptingSupport: boolean;
  } | null;
}) {
  return (
    <div className="space-y-10">
      {/* 対象プロジェクト */}
      {currentProject && (
        <section className="rounded-lg border border-kampo-200 bg-kampo-50 p-5">
          <p className="text-xs font-medium text-kampo-700">支援するプロジェクト</p>
          <h2 className="mt-1 text-lg font-bold text-kampo-900">
            <Link href={`/crowdfunding/${currentProject.id}`} className="hover:underline">
              {currentProject.title}
            </Link>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{currentProject.summary}</p>
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-gray-600">
            {currentProject.goalAmount !== null && (
              <div className="flex gap-2">
                <dt className="text-gray-500">目標金額</dt>
                <dd className="font-medium">{formatYen(currentProject.goalAmount)}</dd>
              </div>
            )}
            {currentProject.endDate && (
              <div className="flex gap-2">
                <dt className="text-gray-500">募集終了</dt>
                <dd className="font-medium">{formatDate(currentProject.endDate)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* 手順 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-kampo-900">ご支援の流れ</h2>
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-lg border border-sand-200 bg-white px-4 py-3"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kampo-700 text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-kampo-900">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 振込先 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-kampo-900">振込先口座</h2>
        <BankAccountCard account={account} />
      </section>

      {/* 報告フォーム */}
      <section id="report">
        <h2 className="mb-4 text-lg font-bold text-kampo-900">振込が完了したら</h2>
        <DonationForm projects={projects} defaultProjectId={currentProject?.id} />
      </section>
    </div>
  );
}
