/**
 * app/layout.tsx
 * 全ページ共通のレイアウト（Header / Footer）
 */
import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SITE_NAME } from '@/lib/constants';
import { getSiteSettings } from '@/lib/site-settings';
import './globals.css';

// 説明文は管理画面「トップページ設定」の団体紹介文を使う
export async function generateMetadata(): Promise<Metadata> {
  const { description } = await getSiteSettings();
  return {
    title: {
      default: `${SITE_NAME} | 東洋医学を学ぶ学生団体`,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    openGraph: {
      title: SITE_NAME,
      description,
      type: 'website',
      locale: 'ja_JP',
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#31502e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <SessionProvider>
          {/* キーボード利用者向けスキップリンク */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-kampo-700 focus:px-4 focus:py-2 focus:text-white"
          >
            本文へスキップ
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
