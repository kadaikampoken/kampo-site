'use client';

/**
 * components/forms/register-form.tsx
 */
import { useActionState } from 'react';
import Link from 'next/link';

import { registerAction } from '@/app/actions/auth';
import { initialActionState } from '@/lib/validations';
import { Field, Input } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}

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

      <Field label="メールアドレス" htmlFor="email" required errors={state.errors?.email}>
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
        label="所属（学部・学科・学年）"
        htmlFor="affiliation"
        errors={state.errors?.affiliation}
        hint="任意項目です。例：医学部医学科 2年"
      >
        <Input
          id="affiliation"
          name="affiliation"
          defaultValue={state.values?.affiliation ?? ''}
          error={Boolean(state.errors?.affiliation)}
          placeholder="医学部医学科 2年"
        />
      </Field>

      <Field
        label="パスワード"
        htmlFor="password"
        required
        errors={state.errors?.password}
        hint="8文字以上、英字と数字をそれぞれ1文字以上含めてください。"
      >
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          error={Boolean(state.errors?.password)}
        />
      </Field>

      <Field
        label="パスワード（確認）"
        htmlFor="passwordConfirm"
        required
        errors={state.errors?.passwordConfirm}
      >
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          error={Boolean(state.errors?.passwordConfirm)}
        />
      </Field>

      <SubmitButton pendingLabel="登録中…" className="w-full">
        この内容で登録する
      </SubmitButton>

      <p className="text-center text-sm text-gray-600">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="font-medium text-kampo-700 underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
