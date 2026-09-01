'use client';

/**
 * components/admin/monthly-confirm-form.tsx
 * 指定した年月の入金確認済み支援を集計し、公開用の月次実績として確定する。
 */
import { useActionState } from 'react';

import { confirmMonthlySummaryAction } from '@/app/actions/monthly';
import { initialActionState } from '@/lib/validations';
import { Field, Input, Select } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export function MonthlyConfirmForm({
  defaultYear,
  defaultMonth,
}: {
  defaultYear: number;
  defaultMonth: number;
}) {
  const [state, formAction] = useActionState(confirmMonthlySummaryAction, initialActionState);

  return (
    <div className="rounded-lg border border-kampo-200 bg-kampo-50 p-6">
      <h2 className="text-base font-bold text-kampo-900">月次集計の確定</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        指定した年月の「入金確認済み」の支援を集計し、公開ページに掲載する実績として確定します。
        すでに確定済みの月を再度実行すると、最新の内容で上書きされます。
      </p>

      {state.message && (
        <Alert tone={state.ok ? 'success' : 'error'} className="mt-4">
          {state.message}
        </Alert>
      )}

      <form action={formAction} className="mt-5 flex flex-wrap items-end gap-4">
        <div className="w-28">
          <Field label="年" htmlFor="year" required errors={state.errors?.year}>
            <Input
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2200}
              required
              defaultValue={String(defaultYear)}
              error={Boolean(state.errors?.year)}
            />
          </Field>
        </div>
        <div className="w-28">
          <Field label="月" htmlFor="month" required errors={state.errors?.month}>
            <Select
              id="month"
              name="month"
              defaultValue={String(defaultMonth)}
              error={Boolean(state.errors?.month)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <SubmitButton pendingLabel="集計中…">この月の実績を確定する</SubmitButton>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-gray-600">
        ※ 集計対象は「振込日」がその月に含まれ、かつ状態が「入金確認済み」の支援です。
        入金未確認・無効の支援は集計に含まれません。
      </p>
    </div>
  );
}
