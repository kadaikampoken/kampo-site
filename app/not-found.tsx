/**
 * app/not-found.tsx  （項目23：404）
 */
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/button';
import { MAIN_NAV } from '@/lib/nav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-6xl font-bold text-kampo-200" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-kampo-900">
        お探しのページは見つかりませんでした
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600">
        URLが変更されたか、削除された可能性があります。
        下のリンクからお探しください。
      </p>

      <div className="mt-8">
        <LinkButton href="/">ホームへ戻る</LinkButton>
      </div>

      <nav aria-label="主要ページ" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-kampo-700 underline hover:text-kampo-900">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
