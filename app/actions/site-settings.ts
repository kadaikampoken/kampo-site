'use server';

/**
 * app/actions/site-settings.ts
 * トップページ設定（大見出し・団体紹介文・活動紹介）の保存（管理者のみ）
 */
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import {
  SITE_SETTINGS_ID,
  siteSettingsFormSchema,
  fromFormInput,
} from '@/lib/site-settings';
import {
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

export async function updateSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = siteSettingsFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      message: '入力内容を確認してください。',
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  const content = fromFormInput(parsed.data);

  try {
    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: { id: SITE_SETTINGS_ID, content },
      update: { content },
    });
  } catch (error) {
    console.error('[site-settings] 保存に失敗しました', error);
    return {
      ok: false,
      message:
        '保存できませんでした。データベースの準備（マイグレーション）が済んでいない可能性があります。',
      values: formDataToObject(formData),
    };
  }

  // トップページと、説明文を使う全ページのメタ情報を更新する
  revalidatePath('/', 'layout');
  revalidatePath('/admin/site');

  return { ok: true, message: 'トップページの文言を更新しました。' };
}
