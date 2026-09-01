'use server';

/**
 * app/actions/bank-account.ts
 * 振込先口座情報の設定（管理者のみ）
 */
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import { BANK_ACCOUNT_ID } from '@/lib/bank';
import {
  bankAccountSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

export async function updateBankAccountAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = bankAccountSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  const data = parsed.data;

  await prisma.bankAccount.upsert({
    where: { id: BANK_ACCOUNT_ID },
    create: { id: BANK_ACCOUNT_ID, ...data },
    update: data,
  });

  // 振込先を表示しているページを更新する
  revalidatePath('/crowdfunding');
  revalidatePath('/admin/bank-account');

  return { ok: true, message: '振込先情報を更新しました。' };
}
