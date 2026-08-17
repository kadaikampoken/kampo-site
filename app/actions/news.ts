'use server';

/**
 * app/actions/news.ts  広報の作成・更新・削除（管理者のみ）
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import {
  newsSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

function revalidateNews(id?: string) {
  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath('/admin/news');
  revalidatePath('/admin');
  if (id) revalidatePath(`/news/${id}`);
}

export async function createNewsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = newsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const data = parsed.data;
  await prisma.news.create({
    data: {
      ...data,
      publishedAt: data.published ? new Date() : null,
      authorId: guard.user.id,
    },
  });

  revalidateNews();
  redirect('/admin/news?created=1');
}

export async function updateNewsAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = newsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const current = await prisma.news.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!current) return { ok: false, message: '記事が見つかりませんでした。' };

  const data = parsed.data;
  await prisma.news.update({
    where: { id },
    data: {
      ...data,
      // 初めて公開するときだけ公開日時をセットする
      publishedAt: data.published ? current.publishedAt ?? new Date() : null,
    },
  });

  revalidateNews(id);
  redirect('/admin/news?updated=1');
}

export async function deleteNewsAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.news.delete({ where: { id } }).catch(() => null);
  revalidateNews(id);
  redirect('/admin/news?deleted=1');
}

/** 一覧から公開／非公開を切り替える */
export async function toggleNewsPublishedAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  const current = await prisma.news.findUnique({
    where: { id },
    select: { published: true, publishedAt: true },
  });
  if (!current) return;

  await prisma.news.update({
    where: { id },
    data: {
      published: !current.published,
      publishedAt: !current.published ? current.publishedAt ?? new Date() : null,
    },
  });

  revalidateNews(id);
}
