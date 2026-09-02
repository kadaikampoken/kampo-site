/**
 * lib/auth-guard.ts
 * サーバーコンポーネント／サーバーアクションから呼ぶ権限チェック。
 * middleware だけに頼らず、データ取得・更新の直前でも必ず検証する（多層防御）。
 *
 * 権限の考え方：
 *   USER      … 一般会員。イベント参加登録、マイページ、会員一覧の閲覧
 *   SUPPORTER … 上記＋イベントの作成と、自分が作成したイベントの編集・削除
 *   ADMIN     … すべての操作
 */
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import type { Role } from '@prisma/client';
import { auth } from '@/auth';

/** 管理エリアに入れる権限（管理者またはサポーター） */
export const STAFF_ROLES: Role[] = ['ADMIN', 'SUPPORTER'];

export function isAdmin(role: Role | undefined | null): boolean {
  return role === 'ADMIN';
}

export function isStaff(role: Role | undefined | null): boolean {
  return role === 'ADMIN' || role === 'SUPPORTER';
}

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
  if (!isAdmin(session.user.role)) {
    redirect('/mypage?error=forbidden');
  }
  return session.user;
}

/** 管理者またはサポーター必須（管理エリアの入口） */
export async function requireStaff(callbackUrl = '/admin'): Promise<Session['user']> {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!isStaff(session.user.role)) {
    redirect('/mypage?error=forbidden');
  }
  return session.user;
}

/**
 * サーバーアクション用。リダイレクトせず判定結果を返す。
 */
export async function getSessionUser(): Promise<Session['user'] | null> {
  const session = await auth();
  return session?.user ?? null;
}

export type GuardResult =
  | { ok: true; user: Session['user'] }
  | { ok: false; message: string };

export async function assertAdmin(): Promise<GuardResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: 'ログインが必要です' };
  if (!isAdmin(user.role)) return { ok: false, message: 'この操作には管理者権限が必要です' };
  return { ok: true, user };
}

/** 管理者またはサポーターであることを確認する */
export async function assertStaff(): Promise<GuardResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: 'ログインが必要です' };
  if (!isStaff(user.role)) {
    return { ok: false, message: 'この操作には管理者またはサポーター権限が必要です' };
  }
  return { ok: true, user };
}

/**
 * イベントを編集・削除できるかを判定する。
 *   管理者      … すべてのイベント
 *   サポーター  … 自分が作成したイベントのみ
 */
export function canEditEvent(
  user: { id: string; role: Role },
  event: { createdById: string | null }
): boolean {
  if (isAdmin(user.role)) return true;
  if (user.role === 'SUPPORTER') return event.createdById === user.id;
  return false;
}
