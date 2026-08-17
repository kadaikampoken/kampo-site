/**
 * middleware.ts
 * すべてのリクエストで認証状態を評価し、
 * auth.config.ts の authorized コールバックでアクセス制御を行う。
 */
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // 静的ファイル・画像最適化・favicon を除くすべてのパス
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)'],
};
