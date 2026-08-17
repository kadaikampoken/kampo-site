'use client';

/**
 * components/admin/timeline-form.tsx  （項目41：年表管理）
 */
import { useActionState } from 'react';
import Link from 'next/link';

import { initialActionState, type ActionState } from '@/lib/validations';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export type TimelineFormValues = {
  year: string;
  month: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  published: boolean;
};

const EMPTY: TimelineFormValues = {
  year: String(new Date().getFullYear()),
  month: '',
  title: '',
  summary: '',
  body: '',
  coverImage: '',
  published: true,
};

export function TimelineForm({
  action,
  defaultValues = EMPTY,
  submitLabel = '保存する',
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: TimelineFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) } as TimelineFormValues;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="年（西暦）" htmlFor="year" required errors={state.errors?.year}>
          <Input id="year" name="year" type="number" min={1900} max={2200} required defaultValue={v.year} error={Boolean(state.errors?.year)} />
        </Field>
        <Field label="月" htmlFor="month" errors={state.errors?.month} hint="任意。空欄の場合は年のみ表示されます。">
          <Select id="month" name="month" defaultValue={v.month} error={Boolean(state.errors?.month)}>
            <option value="">指定なし</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="タイトル" htmlFor="title" required errors={state.errors?.title}>
        <Input id="title" name="title" required maxLength={120} defaultValue={v.title} error={Boolean(state.errors?.title)} />
      </Field>

      <Field label="概要" htmlFor="summary" required errors={state.errors?.summary} hint="年表の一覧に表示されます（200文字以内）。">
        <Textarea id="summary" name="summary" required rows={3} maxLength={200} defaultValue={v.summary} error={Boolean(state.errors?.summary)} className="min-h-0" />
      </Field>

      <Field label="本文" htmlFor="body" required errors={state.errors?.body}>
        <Textarea id="body" name="body" required rows={12} defaultValue={v.body} error={Boolean(state.errors?.body)} />
      </Field>

      <Field label="カバー画像URL" htmlFor="coverImage" errors={state.errors?.coverImage}>
        <Input id="coverImage" name="coverImage" type="url" defaultValue={v.coverImage} error={Boolean(state.errors?.coverImage)} placeholder="https://…" />
      </Field>

      <div className="rounded-md border border-sand-200 bg-sand-50 p-4">
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="published" defaultChecked={Boolean(defaultValues.published)} />
          <span className="font-medium text-kampo-900">この項目を公開する</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">{submitLabel}</SubmitButton>
        <Link href="/admin/history" className="text-sm text-gray-600 underline hover:text-gray-900">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
