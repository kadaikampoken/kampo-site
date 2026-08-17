/**
 * app/login/page.tsx  （項目34：ログイン）
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/forms/login-form';
import { Alert } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'ログイン',
  description: '会員の方はこちらからログインしてください。',
};

type SearchParams = Promise<{ callbackUrl?: string; registered?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // オープンリダイレクト対策：自サイト内のパスのみ許可
  const raw = sp.callbackUrl ?? '/mypage';
  const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/mypage';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-sand-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-kampo-900">ログイン</h1>
        <p className="mt-2 text-sm text-gray-600">
          イベントの参加登録やマイページのご利用にはログインが必要です。
        </p>

        {sp.registered && (
          <Alert tone="success" className="mt-5">
            会員登録が完了しました。登録したメールアドレスでログインしてください。
          </Alert>
        )}
        {sp.error && (
          <Alert tone="error" className="mt-5">
            ログインに失敗しました。入力内容をご確認ください。
          </Alert>
        )}

        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        <Link href="/" className="underline hover:text-kampo-700">
          ホームへ戻る
        </Link>
      </p>
    </div>
  );
}
