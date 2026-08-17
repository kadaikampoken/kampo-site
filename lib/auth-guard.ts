/**
 * lib/auth-guard.ts
 * サーバーコンポーネント／サーバーアクションから呼ぶ権限チェック（項目47）。
 * middleware だけに頼らず、データ取得・更新の直前でも必ず検証する（多層防御）。
 */
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from '@/auth';

/** ログイン必須。未ログインならログインページへリダイレクト */
export async function requireUser(callbackUrl = '/mypage'): Promise<Session['user']> {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session.user;
}

/** 管理者必須。権限がなければマイページへリダイレクト */
export async function requireAdmin(): Promise<Session['user']> {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/mypage?error=forbidden');
  }
  return session.user;
}

/**
 * サーバーアクション用。リダイレクトせず判定結果を返す。
 * 失敗時は ActionState を返して呼び出し側でフォームにエラー表示する。
 */
export async function getSessionUser(): Promise<Session['user'] | null> {
  const session = await auth();
  return session?.user ?? null;
}

export async function assertAdmin(): Promise<
  { ok: true; user: Session['user'] } | { ok: false; message: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: 'ログインが必要です' };
  if (user.role !== 'ADMIN') return { ok: false, message: 'この操作には管理者権限が必要です' };
  return { ok: true, user };
}
