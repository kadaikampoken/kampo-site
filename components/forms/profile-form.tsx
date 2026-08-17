'use client';

/**
 * components/forms/profile-form.tsx
 */
import { useActionState } from 'react';

import { updateProfileAction, changePasswordAction } from '@/app/actions/auth';
import { initialActionState } from '@/lib/validations';
import { Field, Input, Textarea } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: { name: string; affiliation: string | null; bio: string | null };
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      <Field label="お名前" htmlFor="profile-name" required errors={state.errors?.name}>
        <Input
          id="profile-name"
          name="name"
          required
          defaultValue={state.values?.name ?? defaultValues.name}
          error={Boolean(state.errors?.name)}
        />
      </Field>

      <Field label="所属" htmlFor="profile-affiliation" errors={state.errors?.affiliation}>
        <Input
          id="profile-affiliation"
          name="affiliation"
          defaultValue={state.values?.affiliation ?? defaultValues.affiliation ?? ''}
          error={Boolean(state.errors?.affiliation)}
          placeholder="医学部医学科 2年"
        />
      </Field>

      <Field
        label="自己紹介"
        htmlFor="profile-bio"
        errors={state.errors?.bio}
        hint="500文字以内。会員向けの一覧に表示される想定です。"
      >
        <Textarea
          id="profile-bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={state.values?.bio ?? defaultValues.bio ?? ''}
          error={Boolean(state.errors?.bio)}
        />
      </Field>

      <SubmitButton pendingLabel="保存中…">変更を保存</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      <Field
        label="現在のパスワード"
        htmlFor="currentPassword"
        required
        errors={state.errors?.currentPassword}
      >
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          error={Boolean(state.errors?.currentPassword)}
        />
      </Field>

      <Field
        label="新しいパスワード"
        htmlFor="newPassword"
        required
        errors={state.errors?.newPassword}
        hint="8文字以上、英字と数字をそれぞれ1文字以上。"
      >
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          error={Boolean(state.errors?.newPassword)}
        />
      </Field>

      <Field
        label="新しいパスワード（確認）"
        htmlFor="newPasswordConfirm"
        required
        errors={state.errors?.newPasswordConfirm}
      >
        <Input
          id="newPasswordConfirm"
          name="newPasswordConfirm"
          type="password"
          required
          autoComplete="new-password"
          error={Boolean(state.errors?.newPasswordConfirm)}
        />
      </Field>

      <SubmitButton pendingLabel="変更中…" variant="outline">
        パスワードを変更
      </SubmitButton>
    </form>
  );
}
