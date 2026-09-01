'use client';

/**
 * components/admin/event-form.tsx  （項目40：イベント管理）
 */
import { useActionState } from 'react';
import Link from 'next/link';

import { initialActionState, type ActionState } from '@/lib/validations';
import { Field, Input, Textarea, Checkbox } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export type EventFormValues = {
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  deadline: string;
  published: boolean;
  /** 公開開始日時（datetime-local 形式の文字列） */
  publishAt: string;
};

const EMPTY: EventFormValues = {
  title: '',
  summary: '',
  description: '',
  coverImage: '',
  location: '',
  startsAt: '',
  endsAt: '',
  capacity: '',
  deadline: '',
  published: false,
  publishAt: '',
};

export function EventForm({
  action,
  defaultValues = EMPTY,
  submitLabel = '保存する',
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: EventFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) } as EventFormValues;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <Field label="イベント名" htmlFor="title" required errors={state.errors?.title}>
        <Input id="title" name="title" required maxLength={120} defaultValue={v.title} error={Boolean(state.errors?.title)} />
      </Field>

      <Field label="概要" htmlFor="summary" required errors={state.errors?.summary} hint="200文字以内">
        <Textarea id="summary" name="summary" required rows={3} maxLength={200} defaultValue={v.summary} error={Boolean(state.errors?.summary)} className="min-h-0" />
      </Field>

      <Field label="開催内容" htmlFor="description" required errors={state.errors?.description}>
        <Textarea id="description" name="description" required rows={14} defaultValue={v.description} error={Boolean(state.errors?.description)} />
      </Field>

      <Field label="開催場所" htmlFor="location" required errors={state.errors?.location}>
        <Input id="location" name="location" required maxLength={120} defaultValue={v.location} error={Boolean(state.errors?.location)} placeholder="桜ヶ丘キャンパス 講義棟 第3講義室" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="開始日時" htmlFor="startsAt" required errors={state.errors?.startsAt}>
          <Input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={v.startsAt} error={Boolean(state.errors?.startsAt)} />
        </Field>
        <Field label="終了日時" htmlFor="endsAt" errors={state.errors?.endsAt} hint="任意">
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={v.endsAt} error={Boolean(state.errors?.endsAt)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="定員（人）" htmlFor="capacity" errors={state.errors?.capacity} hint="空欄にすると定員なしになります。">
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={v.capacity} error={Boolean(state.errors?.capacity)} />
        </Field>
        <Field label="申込締切" htmlFor="deadline" errors={state.errors?.deadline} hint="任意。開始日時以前を指定してください。">
          <Input id="deadline" name="deadline" type="datetime-local" defaultValue={v.deadline} error={Boolean(state.errors?.deadline)} />
        </Field>
      </div>

      <Field label="カバー画像URL" htmlFor="coverImage" errors={state.errors?.coverImage}>
        <Input id="coverImage" name="coverImage" type="url" defaultValue={v.coverImage} error={Boolean(state.errors?.coverImage)} placeholder="https://…" />
      </Field>

      <div className="rounded-md border border-sand-200 bg-sand-50 p-4">
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="published" defaultChecked={Boolean(defaultValues.published)} />
          <span>
            <span className="font-medium text-kampo-900">このイベントを公開する</span>
            <span className="mt-0.5 block text-xs text-gray-600">
              非公開のイベントは一覧に表示されず、参加登録も受け付けません。
            </span>
          </span>
        </label>

        <div className="mt-4 border-t border-sand-200 pt-4">
          <Field
            label="公開開始日時（予約公開）"
            htmlFor="publishAt"
            errors={state.errors?.publishAt}
            hint="空欄のままにすると、保存した時点ですぐ公開されます。未来の日時を指定すると、その時刻になるまで一般には表示されません（自動で公開されます）。"
          >
            <Input
              id="publishAt"
              name="publishAt"
              type="datetime-local"
              defaultValue={v.publishAt}
              error={Boolean(state.errors?.publishAt)}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">{submitLabel}</SubmitButton>
        <Link href="/admin/events" className="text-sm text-gray-600 underline hover:text-gray-900">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
