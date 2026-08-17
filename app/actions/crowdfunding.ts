'use server';

/**
 * app/actions/crowdfunding.ts  クラウドファンディング案件の管理（管理者のみ）
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import {
  projectSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

function revalidateProjects(id?: string) {
  revalidatePath('/');
  revalidatePath('/crowdfunding');
  revalidatePath('/admin/crowdfunding');
  revalidatePath('/admin');
  if (id) revalidatePath(`/crowdfunding/${id}`);
}

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  await prisma.project.create({ data: parsed.data });
  revalidateProjects();
  redirect('/admin/crowdfunding?created=1');
}

export async function updateProjectAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const exists = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { ok: false, message: 'プロジェクトが見つかりませんでした。' };

  await prisma.project.update({ where: { id }, data: parsed.data });
  revalidateProjects(id);
  redirect('/admin/crowdfunding?updated=1');
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.project.delete({ where: { id } }).catch(() => null);
  revalidateProjects(id);
  redirect('/admin/crowdfunding?deleted=1');
}
