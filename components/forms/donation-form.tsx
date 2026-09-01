'use client';

/**
 * components/forms/donation-form.tsx
 * 振込完了フォーム（一般公開）。
 * 送信＝入金確認ではなく「振込のご報告」であることを画面上で明示する。
 */
import { useActionState, useState } from 'react';

import { reportDonationAction } from '@/app/actions/donations';
import { initialActionState } from '@/lib/validations';
import { Field, Input, Textarea, Select } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import { DONOR_DISCLOSURE_OPTIONS } from '@/lib/constants';

export type DonationProjectOption = { id: string; title: string };

export function DonationForm({
  projects,
  defaultProjectId,
}: {
  projects: DonationProjectOption[];
  defaultProjectId?: string;
}) {
  const [state, formAction] = useActionState(reportDonationAction, initialActionState);
  const [disclosure, setDisclosure] = useState<string>('ANONYMOUS');

  // 送信が成功したらフォームを隠して完了メッセージだけ表示する
  if (state.ok) {
    return (
      <div className="rounded-lg border-2 border-kampo-300 bg-kampo-50 p-6">
        <h3 className="text-base font-bold text-kampo-900">ご報告を受け付けました</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{state.message}</p>
        <p className="mt-4 rounded-md bg-white px-4 py-3 text-xs leading-relaxed text-gray-600">
          この時点ではまだ「入金未確認」の状態です。担当者が通帳の入金を確認したうえで、
          確認済みに変更します。確認までにお時間をいただく場合がありますので、あらかじめご了承ください。
        </p>
        <p className="mt-4 text-sm text-gray-700">
          このたびは温かいご支援をいただき、誠にありがとうございました。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-bold text-kampo-900">振込完了フォーム</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        お振込が完了しましたら、こちらからご報告をお願いします。
        入金の照合と、支援実績の集計に使わせていただきます。
      </p>

      {state.message && !state.ok && (
        <Alert tone="error" className="mt-4">
          {state.message}
        </Alert>
      )}

      <form action={formAction} className="mt-5 space-y-5" noValidate>
        <Field label="お名前" htmlFor="name" required errors={state.errors?.name}>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            defaultValue={state.values?.name ?? ''}
            error={Boolean(state.errors?.name)}
            placeholder="鹿大 太郎"
          />
        </Field>

        <Field
          label="メールアドレス"
          htmlFor="email"
          required
          errors={state.errors?.email}
          hint="入金確認のご連絡に使用します。公開されることはありません。"
        >
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email ?? ''}
            error={Boolean(state.errors?.email)}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="支援するプロジェクト"
          htmlFor="projectId"
          errors={state.errors?.projectId}
          hint="特定のプロジェクトを指定しない場合は「指定なし（会の活動全般）」を選んでください。"
        >
          <Select
            id="projectId"
            name="projectId"
            defaultValue={state.values?.projectId ?? defaultProjectId ?? ''}
            error={Boolean(state.errors?.projectId)}
          >
            <option value="">指定なし（会の活動全般）</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="支援金額（円）"
          htmlFor="amount"
          required
          errors={state.errors?.amount}
          hint="実際にお振込いただいた金額をご入力ください。個人ごとの金額が公開されることはありません。"
        >
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={state.values?.amount ?? ''}
            error={Boolean(state.errors?.amount)}
            placeholder="10000"
          />
        </Field>

        <Field
          label="振込名義"
          htmlFor="transferName"
          required
          errors={state.errors?.transferName}
          hint="通帳に記載される名義をご入力ください（例：カダイ タロウ）。入金の照合に使用します。"
        >
          <Input
            id="transferName"
            name="transferName"
            required
            defaultValue={state.values?.transferName ?? ''}
            error={Boolean(state.errors?.transferName)}
            placeholder="カダイ タロウ"
          />
        </Field>

        <Field label="振込日" htmlFor="transferDate" required errors={state.errors?.transferDate}>
          <Input
            id="transferDate"
            name="transferDate"
            type="date"
            required
            defaultValue={state.values?.transferDate ?? ''}
            error={Boolean(state.errors?.transferDate)}
          />
        </Field>

        <fieldset className="rounded-md border border-sand-200 bg-sand-50 p-4">
          <legend className="px-1 text-sm font-medium text-kampo-900">
            支援者名の公開設定 <span className="text-red-600">*</span>
          </legend>
          <p className="mb-3 text-xs leading-relaxed text-gray-600">
            公開ページの「ご支援いただいた皆様」への掲載方法を選べます。
            金額が公開されることは、いずれを選んだ場合でもありません。
          </p>

          <div className="space-y-2">
            {DONOR_DISCLOSURE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-sand-200 bg-white px-4 py-3 text-sm"
              >
                <input
                  type="radio"
                  name="disclosure"
                  value={opt.value}
                  checked={disclosure === opt.value}
                  onChange={() => setDisclosure(opt.value)}
                  className="mt-0.5 h-4 w-4 text-kampo-700 focus:ring-kampo-500"
                />
                <span className="text-gray-800">{opt.label}</span>
              </label>
            ))}
          </div>

          {disclosure === 'CUSTOM_NAME' && (
            <div className="mt-4">
              <Field
                label="掲載希望名"
                htmlFor="displayName"
                required
                errors={state.errors?.displayName}
                hint="例：〇〇株式会社、漢方好きの一会員 など"
              >
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={state.values?.displayName ?? ''}
                  error={Boolean(state.errors?.displayName)}
                />
              </Field>
            </div>
          )}

          {disclosure !== 'CUSTOM_NAME' && (
            <input type="hidden" name="displayName" value="" />
          )}
        </fieldset>

        <Field label="備考（任意）" htmlFor="note" errors={state.errors?.note}>
          <Textarea
            id="note"
            name="note"
            rows={4}
            maxLength={1000}
            defaultValue={state.values?.note ?? ''}
            error={Boolean(state.errors?.note)}
            placeholder="応援メッセージ、領収書のご希望など"
          />
        </Field>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          ご入力いただいた個人情報（お名前・メールアドレス・振込名義・金額）は、
          入金確認と会計処理の目的にのみ使用し、管理者以外は閲覧できません。
          一般公開ページに個人ごとの支援金額を表示することはありません。
        </div>

        <SubmitButton pendingLabel="送信中…" size="lg" className="w-full">
          この内容で報告する
        </SubmitButton>
      </form>
    </div>
  );
}
