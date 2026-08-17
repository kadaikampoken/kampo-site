'use client';

/**
 * components/forms/login-form.tsx
 */
import { useActionState } from 'react';
import Link from 'next/link';

import { loginAction } from '@/app/actions/auth';
import { initialActionState } from '@/lib/validations';
import { Field, Input } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.message && <Alert tone="error">{state.message}</Alert>}

      <Field label="メールアドレス" htmlFor="email" required errors={state.errors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ''}
          error={Boolean(state.errors?.email)}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="パスワード" htmlFor="password" required errors={state.errors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={Boolean(state.errors?.password)}
        />
      </Field>

      <SubmitButton pendingLabel="ログイン中…" className="w-full">
        ログイン
      </SubmitButton>

      <p className="text-center text-sm text-gray-600">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="font-medium text-kampo-700 underline">
          会員登録
        </Link>
      </p>
    </form>
  );
}
