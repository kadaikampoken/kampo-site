'use server';

/**
 * app/actions/timeline.ts  年表エントリの管理（管理者のみ）
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import {
  timelineSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

function revalidateTimeline(id?: string) {
  revalidatePath('/history');
  revalidatePath('/admin/history');
  revalidatePath('/admin');
  if (id) revalidatePath(`/history/${id}`);
}

export async function createTimelineAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = timelineSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  await prisma.timelineEntry.create({ data: parsed.data });
  revalidateTimeline();
  redirect('/admin/history?created=1');
}

export async function updateTimelineAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = timelineSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const exists = await prisma.timelineEntry.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { ok: false, message: '年表エントリが見つかりませんでした。' };

  await prisma.timelineEntry.update({ where: { id }, data: parsed.data });
  revalidateTimeline(id);
  redirect('/admin/history?updated=1');
}

export async function deleteTimelineAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.timelineEntry.delete({ where: { id } }).catch(() => null);
  revalidateTimeline(id);
  redirect('/admin/history?deleted=1');
}
