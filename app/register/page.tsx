/**
 * app/register/page.tsx  （項目35：ユーザー登録）
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '@/components/forms/register-form';

export const metadata: Metadata = {
  title: '会員登録',
  description: '鹿児島大学漢方医学研究会の会員登録ページです。学部・学年を問わず登録できます。',
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-sand-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-kampo-900">会員登録</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          登録は無料です。学部・学年を問わず、どなたでもご登録いただけます。
          登録すると、イベントの参加登録ができるようになります。
        </p>

        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
        ご登録いただいた情報は、当会の活動連絡の目的のみに使用します。
        <br />
        <Link href="/" className="underline hover:text-kampo-700">
          ホームへ戻る
        </Link>
      </p>
    </div>
  );
}
