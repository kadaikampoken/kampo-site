'use client';

/**
 * components/admin/site-settings-form.tsx
 * トップページ設定のフォーム（管理者のみ）
 */
import { useActionState } from 'react';

import { updateSiteSettingsAction } from '@/app/actions/site-settings';
import { initialActionState } from '@/lib/validations';
import { Field, Input, Textarea } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export function SiteSettingsForm({
  defaultValues,
  activitySlots,
}: {
  defaultValues: Record<string, string>;
  activitySlots: number;
}) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialActionState);
  const v = { ...defaultValues, ...(state.values ?? {}) };
  const err = (key: string) => state.errors?.[key];

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      {/* ---------- ヒーロー ---------- */}
      <section className="space-y-6">
        <h2 className="border-b border-sand-200 pb-2 text-lg font-bold text-kampo-900">
          トップの大見出し・紹介文
        </h2>

        <Field
          label="大見出し"
          htmlFor="heroTitle"
          required
          errors={err('heroTitle')}
          hint="改行した位置で、サイトでも改行されます。"
        >
          <Textarea
            id="heroTitle"
            name="heroTitle"
            rows={2}
            className="min-h-0 text-lg font-bold"
            defaultValue={v.heroTitle}
            error={Boolean(err('heroTitle'))}
          />
        </Field>

        <Field
          label="団体紹介文"
          htmlFor="description"
          required
          errors={err('description')}
          hint="大見出しの下に表示されます。検索結果やSNSで共有されたときの説明文にも使われます。"
        >
          <Textarea
            id="description"
            name="description"
            rows={4}
            className="min-h-0"
            defaultValue={v.description}
            error={Boolean(err('description'))}
          />
        </Field>
      </section>

      {/* ---------- 活動紹介 ---------- */}
      <section className="space-y-4">
        <div className="border-b border-sand-200 pb-2">
          <h2 className="text-lg font-bold text-kampo-900">活動紹介</h2>
          <p className="mt-1 text-xs text-gray-500">
            「わたしたちの活動」に並ぶカードです。上から順に表示されます。
            タイトルを空にしたカードは表示されません（最大{activitySlots}件）。
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: activitySlots }, (_, i) => (
            <li key={i} className="rounded-md border border-sand-200 bg-sand-50 p-4">
              <p className="mb-3 text-xs font-semibold text-sand-700">カード {i + 1}</p>
              <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <Field
                  label="アイコン"
                  htmlFor={`activity${i}Icon`}
                  errors={err(`activity${i}Icon`)}
                >
                  <Input
                    id={`activity${i}Icon`}
                    name={`activity${i}Icon`}
                    className="text-center text-xl"
                    placeholder="🌿"
                    defaultValue={v[`activity${i}Icon`]}
                    error={Boolean(err(`activity${i}Icon`))}
                  />
                </Field>
                <Field
                  label="タイトル"
                  htmlFor={`activity${i}Title`}
                  errors={err(`activity${i}Title`)}
                >
                  <Input
                    id={`activity${i}Title`}
                    name={`activity${i}Title`}
                    defaultValue={v[`activity${i}Title`]}
                    error={Boolean(err(`activity${i}Title`))}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field
                  label="説明文"
                  htmlFor={`activity${i}Body`}
                  errors={err(`activity${i}Body`)}
                >
                  <Textarea
                    id={`activity${i}Body`}
                    name={`activity${i}Body`}
                    rows={3}
                    className="min-h-0"
                    defaultValue={v[`activity${i}Body`]}
                    error={Boolean(err(`activity${i}Body`))}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-sand-200 pt-6">
        <SubmitButton pendingLabel="保存中…">トップページに反映する</SubmitButton>
      </div>
    </form>
  );
}
