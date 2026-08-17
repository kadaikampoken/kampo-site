'use client';

/**
 * app/error.tsx  （項目23／45：エラーハンドリング）
 * ページ内で発生した予期しないエラーの受け皿
 */
import { useEffect } from 'react';
import Link from 'next/link';
import { Button, LinkButton } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番では監視サービスへ送信する想定
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-5xl" aria-hidden="true">
        🍵
      </p>
      <h1 className="mt-6 text-2xl font-bold text-kampo-900">
        問題が発生しました
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600">
        ページの表示中にエラーが発生しました。
        時間をおいて再度お試しください。改善しない場合はお問い合わせください。
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-400">エラーID: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>再試行する</Button>
        <LinkButton href="/" variant="outline">
          ホームへ戻る
        </LinkButton>
      </div>
      <p className="mt-8 text-xs text-gray-500">
        <Link href="/news" className="underline hover:text-kampo-700">
          広報一覧
        </Link>
        {' / '}
        <Link href="/events" className="underline hover:text-kampo-700">
          イベント一覧
        </Link>
      </p>
    </div>
  );
}
