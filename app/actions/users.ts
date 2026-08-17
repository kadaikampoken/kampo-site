'use server';

/**
 * app/actions/users.ts  ユーザー管理（管理者のみ・項目42）
 */
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import { userRoleSchema, type ActionState } from '@/lib/validations';

/** 権限の変更 */
export async function updateUserRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = userRoleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: '入力値が不正です。' };

  const { userId, role } = parsed.data;

  // 自分自身の権限は変更できない（自分を締め出す事故を防ぐ）
  if (userId === guard.user.id) {
    return { ok: false, message: '自分自身の権限は変更できません。' };
  }

  // 管理者が0人になるのを防ぐ
  if (role === 'USER') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role === 'ADMIN' && adminCount <= 1) {
      return { ok: false, message: '管理者が0人になるため変更できません。' };
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin/users');
  return { ok: true, message: '権限を変更しました。' };
}

/** 権限変更（フォーム直接送信用） */
export async function setUserRoleAction(formData: FormData): Promise<void> {
  await updateUserRoleAction({ ok: false }, formData);
}

/** ユーザーの削除 */
export async function deleteUserAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const userId = formData.get('userId');
  if (typeof userId !== 'string' || !userId) return;
  if (userId === guard.user.id) return; // 自分自身は削除不可

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (target?.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) return; // 最後の管理者は削除不可
  }

  await prisma.user.delete({ where: { id: userId } }).catch(() => null);
  revalidatePath('/admin/users');
  revalidatePath('/admin');
}
