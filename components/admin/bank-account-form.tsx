'use client';

/**
 * components/admin/bank-account-form.tsx
 * 振込先口座の設定フォーム（管理者のみ）
 */
import { useActionState } from 'react';

import { updateBankAccountAction } from '@/app/actions/bank-account';
import { initialActionState } from '@/lib/validations';
import { Field, Input, Textarea } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import type { BankAccountInfo } from '@/lib/bank';

export function BankAccountForm({ defaultValues }: { defaultValues: BankAccountInfo }) {
  const [state, formAction] = useActionState(updateBankAccountAction, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) } as BankAccountInfo &
    Record<string, string>;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && (
        <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="金融機関名" htmlFor="bankName" required errors={state.errors?.bankName}>
          <Input id="bankName" name="bankName" required defaultValue={v.bankName} error={Boolean(state.errors?.bankName)} />
        </Field>
        <Field label="支店名" htmlFor="branchName" required errors={state.errors?.branchName}>
          <Input id="branchName" name="branchName" required defaultValue={v.branchName} error={Boolean(state.errors?.branchName)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="支店コード" htmlFor="branchCode" required errors={state.errors?.branchCode} hint="数字のみ">
          <Input id="branchCode" name="branchCode" required inputMode="numeric" defaultValue={v.branchCode} error={Boolean(state.errors?.branchCode)} />
        </Field>
        <Field label="口座種別" htmlFor="accountType" required errors={state.errors?.accountType} hint="例：普通預金">
          <Input id="accountType" name="accountType" required defaultValue={v.accountType} error={Boolean(state.errors?.accountType)} />
        </Field>
        <Field label="口座番号" htmlFor="accountNumber" required errors={state.errors?.accountNumber} hint="数字のみ">
          <Input id="accountNumber" name="accountNumber" required inputMode="numeric" defaultValue={v.accountNumber} error={Boolean(state.errors?.accountNumber)} />
        </Field>
      </div>

      <Field label="口座名義" htmlFor="accountHolder" required errors={state.errors?.accountHolder}>
        <Input id="accountHolder" name="accountHolder" required defaultValue={v.accountHolder} error={Boolean(state.errors?.accountHolder)} />
      </Field>

      <Field
        label="口座名義（カナ）"
        htmlFor="accountHolderKana"
        errors={state.errors?.accountHolderKana}
        hint="任意。ネットバンキングでの入力に使われることがあります。"
      >
        <Input id="accountHolderKana" name="accountHolderKana" defaultValue={v.accountHolderKana ?? ''} error={Boolean(state.errors?.accountHolderKana)} />
      </Field>

      <Field
        label="振込にあたっての注意事項"
        htmlFor="note"
        errors={state.errors?.note}
        hint="任意。支援ページの振込先の下に表示されます。"
      >
        <Textarea id="note" name="note" rows={3} defaultValue={v.note ?? ''} error={Boolean(state.errors?.note)} className="min-h-0" />
      </Field>

      <div className="border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">振込先情報を保存</SubmitButton>
      </div>
    </form>
  );
}
