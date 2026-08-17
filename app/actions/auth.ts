'use server';

/**
 * app/actions/auth.ts
 * 認証まわりのサーバーアクション（ログイン／登録／ログアウト／プロフィール更新）
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth-guard';
import {
  loginSchema,
  registerSchema,
  profileSchema,
  passwordChangeSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

/* ------------------------------------------------------------------ */
/* ログイン                                                            */
/* ------------------------------------------------------------------ */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  const callbackUrl = (formData.get('callbackUrl') as string) || '/mypage';
  // オープンリダイレクト対策：自サイト内のパスのみ許可（項目46）
  const safeCallback = callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
    ? callbackUrl
    : '/mypage';

  try {
    await signIn('credentials', {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirectTo: safeCallback,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message: 'メールアドレスまたはパスワードが正しくありません。',
        values: formDataToObject(formData),
      };
    }
    // signIn 成功時の NEXT_REDIRECT はここで再スローする必要がある
    throw error;
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* 会員登録                                                            */
/* ------------------------------------------------------------------ */
export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      errors: { email: ['このメールアドレスは既に登録されています'] },
      values: formDataToObject(formData),
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        affiliation: parsed.data.affiliation,
        passwordHash,
        // 権限は必ず USER 固定。フォームからの role 指定は受け付けない（項目46）
        role: 'USER',
      },
    });
  } catch {
    return {
      ok: false,
      message: '登録処理に失敗しました。時間をおいて再度お試しください。',
      values: formDataToObject(formData),
    };
  }

  // 登録後そのままログインしてマイページへ
  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: '/mypage?welcome=1',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?registered=1');
    }
    throw error;
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* ログアウト                                                          */
/* ------------------------------------------------------------------ */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}

/* ------------------------------------------------------------------ */
/* プロフィール更新                                                    */
/* ------------------------------------------------------------------ */
export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: 'ログインが必要です。' };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name.trim(),
      affiliation: parsed.data.affiliation,
      bio: parsed.data.bio,
    },
  });

  revalidatePath('/mypage');
  return { ok: true, message: 'プロフィールを更新しました。' };
}

/* ------------------------------------------------------------------ */
/* パスワード変更                                                      */
/* ------------------------------------------------------------------ */
export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, message: 'ログインが必要です。' };

  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return { ok: false, message: 'ユーザーが見つかりませんでした。' };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, errors: { currentPassword: ['現在のパスワードが正しくありません'] } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  return { ok: true, message: 'パスワードを変更しました。' };
}
