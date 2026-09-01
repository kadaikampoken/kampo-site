'use server';

/**
 * app/actions/events.ts
 * イベントの管理（管理者）と、参加・不参加登録（ログインユーザー）
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { assertAdmin, getSessionUser } from '@/lib/auth-guard';
import { isEventVisible } from '@/lib/visibility';
import {
  eventSchema,
  attendanceSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

function revalidateEvents(id?: string) {
  revalidatePath('/');
  revalidatePath('/events');
  revalidatePath('/mypage');
  revalidatePath('/admin/events');
  revalidatePath('/admin/participants');
  revalidatePath('/admin');
  if (id) revalidatePath(`/events/${id}`);
}

/* ================================================================== */
/* 管理者：イベント CRUD                                               */
/* ================================================================== */
export async function createEventAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  await prisma.event.create({ data: parsed.data });
  revalidateEvents();
  redirect('/admin/events?created=1');
}

export async function updateEventAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const exists = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { ok: false, message: 'イベントが見つかりませんでした。' };

  await prisma.event.update({ where: { id }, data: parsed.data });
  revalidateEvents(id);
  redirect('/admin/events?updated=1');
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  // 参加登録は onDelete: Cascade で一緒に削除される
  await prisma.event.delete({ where: { id } }).catch(() => null);
  revalidateEvents(id);
  redirect('/admin/events?deleted=1');
}

/* ================================================================== */
/* ログインユーザー：参加・不参加の登録（項目31）                       */
/* ================================================================== */
export async function setAttendanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, message: '参加登録にはログインが必要です。' };
  }

  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values: formDataToObject(formData) };
  }

  const { eventId, status, note } = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      published: true,
      publishAt: true,
      capacity: true,
      deadline: true,
      startsAt: true,
      _count: { select: { attendances: { where: { status: 'ATTENDING' } } } },
    },
  });

  // 未公開・予約公開中のイベントには登録できない
  if (!event || !isEventVisible(event)) {
    return { ok: false, message: 'イベントが見つかりませんでした。' };
  }

  const now = new Date();
  if (event.deadline && event.deadline < now) {
    return { ok: false, message: '申込期限を過ぎているため受け付けできません。' };
  }
  if (event.startsAt < now) {
    return { ok: false, message: '終了したイベントには登録できません。' };
  }

  const existing = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { status: true },
  });

  // 定員チェック（すでに「参加」で登録済みの場合は枠を消費しない）
  if (
    status === 'ATTENDING' &&
    event.capacity !== null &&
    existing?.status !== 'ATTENDING' &&
    event._count.attendances >= event.capacity
  ) {
    return { ok: false, message: '申し訳ありません。定員に達しました。' };
  }

  await prisma.eventAttendance.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id, status, note },
    update: { status, note },
  });

  revalidateEvents(eventId);
  return {
    ok: true,
    message: status === 'ATTENDING' ? '参加登録を受け付けました。' : '不参加として登録しました。',
  };
}

/** 参加登録の取り消し */
export async function cancelAttendanceAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const eventId = formData.get('eventId');
  if (typeof eventId !== 'string' || !eventId) return;

  await prisma.eventAttendance
    .delete({ where: { eventId_userId: { eventId, userId: user.id } } })
    .catch(() => null);

  revalidateEvents(eventId);
}

/* ================================================================== */
/* 管理者：参加者管理（項目43）                                        */
/* ================================================================== */
export async function adminRemoveAttendanceAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.eventAttendance.delete({ where: { id } }).catch(() => null);
  revalidatePath('/admin/participants');
  revalidatePath('/admin');
}
