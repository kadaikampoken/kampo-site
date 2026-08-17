'use client';

/**
 * components/admin/news-form.tsx  （項目38：広報管理）
 */
import { useActionState } from 'react';
import Link from 'next/link';
import type { NewsCategory } from '@prisma/client';

import { initialActionState, type ActionState } from '@/lib/validations';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import { NEWS_CATEGORY_OPTIONS } from '@/lib/constants';

export type NewsFormValues = {
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  coverImage: string;
  published: boolean;
};

const EMPTY: NewsFormValues = {
  title: '',
  excerpt: '',
  content: '',
  category: 'ANNOUNCEMENT',
  coverImage: '',
  published: false,
};

export function NewsForm({
  action,
  defaultValues = EMPTY,
  submitLabel = '保存する',
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: NewsFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) } as NewsFormValues &
    Record<string, string>;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <Field label="タイトル" htmlFor="title" required errors={state.errors?.title}>
        <Input id="title" name="title" required maxLength={120} defaultValue={v.title} error={Boolean(state.errors?.title)} />
      </Field>

      <Field
        label="概要"
        htmlFor="excerpt"
        required
        errors={state.errors?.excerpt}
        hint="一覧ページとSNSシェア時に表示されます（200文字以内）。"
      >
        <Textarea
          id="excerpt"
          name="excerpt"
          required
          rows={3}
          maxLength={200}
          defaultValue={v.excerpt}
          error={Boolean(state.errors?.excerpt)}
          className="min-h-0"
        />
      </Field>

      <Field
        label="本文"
        htmlFor="content"
        required
        errors={state.errors?.content}
        hint="空行で段落が分かれます。HTMLタグは使用できません（そのまま文字として表示されます）。"
      >
        <Textarea id="content" name="content" required rows={16} defaultValue={v.content} error={Boolean(state.errors?.content)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="カテゴリ" htmlFor="category" required errors={state.errors?.category}>
          <Select id="category" name="category" defaultValue={v.category} error={Boolean(state.errors?.category)}>
            {NEWS_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="カバー画像URL"
          htmlFor="coverImage"
          errors={state.errors?.coverImage}
          hint="任意。https:// から始まるURL。"
        >
          <Input id="coverImage" name="coverImage" type="url" defaultValue={v.coverImage} error={Boolean(state.errors?.coverImage)} placeholder="https://…" />
        </Field>
      </div>

      <div className="rounded-md border border-sand-200 bg-sand-50 p-4">
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="published" defaultChecked={Boolean(defaultValues.published)} />
          <span>
            <span className="font-medium text-kampo-900">この記事を公開する</span>
            <span className="mt-0.5 block text-xs text-gray-600">
              チェックを外すと下書きとして保存され、一般には表示されません。
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">{submitLabel}</SubmitButton>
        <Link href="/admin/news" className="text-sm text-gray-600 underline hover:text-gray-900">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
