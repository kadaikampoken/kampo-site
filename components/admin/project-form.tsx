'use client';

/**
 * components/admin/project-form.tsx  （項目39：クラウドファンディング管理）
 */
import { useActionState } from 'react';
import Link from 'next/link';
import type { ProjectStatus } from '@prisma/client';

import { initialActionState, type ActionState } from '@/lib/validations';
import { Field, Input, Textarea, Select } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import { PROJECT_STATUS_OPTIONS } from '@/lib/constants';

export type ProjectFormValues = {
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  goalAmount: string;
  currentAmount: string;
  supporterCount: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  externalUrl: string;
};

const EMPTY: ProjectFormValues = {
  title: '',
  summary: '',
  description: '',
  coverImage: '',
  goalAmount: '',
  currentAmount: '0',
  supporterCount: '0',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  externalUrl: '',
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

      <Field label="概要" htmlFor="summary" required errors={state.errors?.summary} hint="200文字以内">
        <Textarea id="summary" name="summary" required rows={3} maxLength={200} defaultValue={v.summary} error={Boolean(state.errors?.summary)} className="min-h-0" />
      </Field>

      <Field label="本文" htmlFor="description" required errors={state.errors?.description} hint="空行で段落が分かれます。">
        <Textarea id="description" name="description" required rows={16} defaultValue={v.description} error={Boolean(state.errors?.description)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="目標金額（円）" htmlFor="goalAmount" required errors={state.errors?.goalAmount}>
          <Input id="goalAmount" name="goalAmount" type="number" min={1000} step={1000} required defaultValue={v.goalAmount} error={Boolean(state.errors?.goalAmount)} />
        </Field>
        <Field label="現在の支援額（円）" htmlFor="currentAmount" required errors={state.errors?.currentAmount} hint="外部CFサイトの値を手動で更新します。">
          <Input id="currentAmount" name="currentAmount" type="number" min={0} required defaultValue={v.currentAmount} error={Boolean(state.errors?.currentAmount)} />
        </Field>
        <Field label="支援者数（人）" htmlFor="supporterCount" required errors={state.errors?.supporterCount}>
          <Input id="supporterCount" name="supporterCount" type="number" min={0} required defaultValue={v.supporterCount} error={Boolean(state.errors?.supporterCount)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="開始日" htmlFor="startDate" required errors={state.errors?.startDate}>
          <Input id="startDate" name="startDate" type="date" required defaultValue={v.startDate} error={Boolean(state.errors?.startDate)} />
        </Field>
        <Field label="終了日" htmlFor="endDate" required errors={state.errors?.endDate}>
          <Input id="endDate" name="endDate" type="date" required defaultValue={v.endDate} error={Boolean(state.errors?.endDate)} />
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
        <Field label="外部支援ページURL" htmlFor="externalUrl" errors={state.errors?.externalUrl} hint="READYFOR / CAMPFIRE などのURL。">
          <Input id="externalUrl" name="externalUrl" type="url" defaultValue={v.externalUrl} error={Boolean(state.errors?.externalUrl)} placeholder="https://…" />
        </Field>
        <Field label="カバー画像URL" htmlFor="coverImage" errors={state.errors?.coverImage}>
          <Input id="coverImage" name="coverImage" type="url" defaultValue={v.coverImage} error={Boolean(state.errors?.coverImage)} placeholder="https://…" />
        </Field>
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        「準備中」のプロジェクトは一般ページに表示されません。決済は外部サービス上で行われ、
        本サイトでは決済情報を保持しません。
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
