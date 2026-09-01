'use client';

/**
 * components/admin/project-form.tsx  （項目39：クラウドファンディング管理）
 * 目標金額・募集期間は任意。支援を募集する目的と支援金の用途を掲載できる。
 */
import { useActionState } from 'react';
import Link from 'next/link';
import type { ProjectStatus } from '@prisma/client';

import { initialActionState, type ActionState } from '@/lib/validations';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import { PROJECT_STATUS_OPTIONS } from '@/lib/constants';

export type ProjectFormValues = {
  title: string;
  summary: string;
  description: string;
  purpose: string;
  fundUsage: string;
  coverImage: string;
  goalAmount: string;
  currentAmount: string;
  supporterCount: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  externalUrl: string;
  publishAt: string;
  acceptingSupport: boolean;
};

const EMPTY: ProjectFormValues = {
  title: '',
  summary: '',
  description: '',
  purpose: '',
  fundUsage: '',
  coverImage: '',
  goalAmount: '',
  currentAmount: '0',
  supporterCount: '0',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  externalUrl: '',
  publishAt: '',
  acceptingSupport: true,
};

export function ProjectForm({
  action,
  defaultValues = EMPTY,
  submitLabel = '保存する',
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: ProjectFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) } as ProjectFormValues;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <Field label="プロジェクト名" htmlFor="title" required errors={state.errors?.title}>
        <Input id="title" name="title" required maxLength={120} defaultValue={v.title} error={Boolean(state.errors?.title)} />
      </Field>

      <Field label="概要" htmlFor="summary" required errors={state.errors?.summary} hint="一覧に表示されます（200文字以内）">
        <Textarea id="summary" name="summary" required rows={3} maxLength={200} defaultValue={v.summary} error={Boolean(state.errors?.summary)} className="min-h-0" />
      </Field>

      <Field label="本文" htmlFor="description" required errors={state.errors?.description} hint="空行で段落が分かれます。">
        <Textarea id="description" name="description" required rows={14} defaultValue={v.description} error={Boolean(state.errors?.description)} />
      </Field>

      <Field
        label="支援を募集する目的"
        htmlFor="purpose"
        errors={state.errors?.purpose}
        hint="任意。なぜ支援が必要なのかを記載します。"
      >
        <Textarea id="purpose" name="purpose" rows={6} defaultValue={v.purpose} error={Boolean(state.errors?.purpose)} />
      </Field>

      <Field
        label="支援金の用途"
        htmlFor="fundUsage"
        errors={state.errors?.fundUsage}
        hint="任意。内訳を箇条書きで記載すると分かりやすくなります。支援実績ページにも表示されます。"
      >
        <Textarea
          id="fundUsage"
          name="fundUsage"
          rows={6}
          defaultValue={v.fundUsage}
          error={Boolean(state.errors?.fundUsage)}
          placeholder={'生薬標本の購入費　900,000円\n標本ケース・什器　450,000円\nカタログ制作費　100,000円'}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field
          label="目標金額（円）"
          htmlFor="goalAmount"
          errors={state.errors?.goalAmount}
          hint="空欄にすると目標金額なしで公開されます。"
        >
          <Input id="goalAmount" name="goalAmount" type="number" min={1000} step={1000} defaultValue={v.goalAmount} error={Boolean(state.errors?.goalAmount)} />
        </Field>
        <Field
          label="公開用の累計支援額（円）"
          htmlFor="currentAmount"
          errors={state.errors?.currentAmount}
          hint="通常は月次集計の確定時に自動更新されます。手動で調整したい場合のみ変更してください。"
        >
          <Input id="currentAmount" name="currentAmount" type="number" min={0} required defaultValue={v.currentAmount} error={Boolean(state.errors?.currentAmount)} />
        </Field>
        <Field
          label="公開用の支援者数（延べ）"
          htmlFor="supporterCount"
          errors={state.errors?.supporterCount}
          hint="同上。月次集計の確定時に自動更新されます。"
        >
          <Input id="supporterCount" name="supporterCount" type="number" min={0} required defaultValue={v.supporterCount} error={Boolean(state.errors?.supporterCount)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="募集開始日" htmlFor="startDate" errors={state.errors?.startDate} hint="任意">
          <Input id="startDate" name="startDate" type="date" defaultValue={v.startDate} error={Boolean(state.errors?.startDate)} />
        </Field>
        <Field label="募集終了日" htmlFor="endDate" errors={state.errors?.endDate} hint="任意">
          <Input id="endDate" name="endDate" type="date" defaultValue={v.endDate} error={Boolean(state.errors?.endDate)} />
        </Field>
        <Field label="公開ステータス" htmlFor="status" required errors={state.errors?.status}>
          <Select id="status" name="status" defaultValue={v.status} error={Boolean(state.errors?.status)}>
            {PROJECT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="外部支援ページURL" htmlFor="externalUrl" errors={state.errors?.externalUrl} hint="外部のCFサイトも併用する場合のみ。">
          <Input id="externalUrl" name="externalUrl" type="url" defaultValue={v.externalUrl} error={Boolean(state.errors?.externalUrl)} placeholder="https://…" />
        </Field>
        <Field label="カバー画像URL" htmlFor="coverImage" errors={state.errors?.coverImage}>
          <Input id="coverImage" name="coverImage" type="url" defaultValue={v.coverImage} error={Boolean(state.errors?.coverImage)} placeholder="https://…" />
        </Field>
      </div>

      <div className="rounded-md border border-sand-200 bg-sand-50 p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="acceptingSupport" defaultChecked={Boolean(defaultValues.acceptingSupport)} className="mt-0.5" />
          <span>
            <span className="font-medium text-kampo-900">銀行振込による支援を受け付ける</span>
            <span className="mt-0.5 block text-xs text-gray-600">
              チェックを外すと、このプロジェクトの支援ページと振込完了フォームでの選択ができなくなります。
            </span>
          </span>
        </label>

        <div className="mt-4 border-t border-sand-200 pt-4">
          <Field
            label="公開開始日時（予約公開）"
            htmlFor="publishAt"
            errors={state.errors?.publishAt}
            hint="空欄なら保存時にすぐ公開（ステータスが「準備中」以外の場合）。未来の日時を指定すると、その時刻まで一般には表示されません。"
          >
            <Input id="publishAt" name="publishAt" type="datetime-local" defaultValue={v.publishAt} error={Boolean(state.errors?.publishAt)} />
          </Field>
        </div>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        「準備中」のプロジェクトは一般ページに表示されません。
        当サイトでは決済を行わず、支援は銀行振込のみです。カード情報等をお預かりすることはありません。
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">{submitLabel}</SubmitButton>
        <Link href="/admin/crowdfunding" className="text-sm text-gray-600 underline hover:text-gray-900">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
