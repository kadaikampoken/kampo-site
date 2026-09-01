'use server';

/**
 * app/actions/donations.ts
 * 振込完了フォームの受付（一般公開）と、支援情報の管理（管理者のみ）。
 *
 * プライバシー方針：
 *   氏名・メールアドレス・振込名義・個人別の支援金額は、
 *   管理者権限を持つユーザーだけが閲覧できる。ここでは書き込みのみを扱い、
 *   読み取りは管理画面のサーバーコンポーネントからのみ行う。
 */
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import { isProjectVisible } from '@/lib/visibility';
import {
  donationReportSchema,
  donationStatusSchema,
  donationAdminSchema,
  toFieldErrors,
  formDataToObject,
  type ActionState,
} from '@/lib/validations';

function revalidateDonations() {
  revalidatePath('/crowdfunding');
  revalidatePath('/crowdfunding/results');
  revalidatePath('/admin/donations');
  revalidatePath('/admin/monthly');
  revalidatePath('/admin');
}

/* ================================================================== */
/* 一般公開：振込完了フォームの送信                                    */
/* ================================================================== */
export async function reportDonationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = donationReportSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      errors: toFieldErrors(parsed.error),
      values: formDataToObject(formData),
    };
  }

  const data = parsed.data;

  // プロジェクトが指定されている場合は、公開中で受付可能かを検証する
  let projectId: string | null = null;
  if (data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true, status: true, publishAt: true, acceptingSupport: true },
    });
    if (!project || !isProjectVisible(project) || !project.acceptingSupport) {
      return {
        ok: false,
        errors: { projectId: ['選択されたプロジェクトは現在支援を受け付けていません'] },
        values: formDataToObject(formData),
      };
    }
    projectId = project.id;
  }

  await prisma.donation.create({
    data: {
      projectId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      amount: data.amount,
      transferName: data.transferName.trim(),
      transferDate: data.transferDate,
      disclosure: data.disclosure,
      // 匿名・実名掲載のときは掲載希望名を保存しない
      displayName: data.disclosure === 'CUSTOM_NAME' ? data.displayName : null,
      note: data.note,
      // 送信時点では必ず「入金未確認」。確認は管理者が行う
      status: 'REPORTED',
    },
  });

  revalidateDonations();

  return {
    ok: true,
    message:
      'ご報告ありがとうございました。入金の確認ができ次第、担当者が確認処理を行います。確認までお時間をいただく場合があります。',
  };
}

/* ================================================================== */
/* 管理者：入金確認状態の変更                                          */
/* ================================================================== */
export async function updateDonationStatusAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const parsed = donationStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  const { id, status } = parsed.data;

  await prisma.donation
    .update({
      where: { id },
      data: {
        status,
        // 「入金確認済み」にした時刻を記録する
        confirmedAt: status === 'CONFIRMED' ? new Date() : null,
      },
    })
    .catch(() => null);

  revalidateDonations();
}

/** 管理者：金額・メモの修正 */
export async function updateDonationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = donationAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  const { id, status, amount, adminMemo } = parsed.data;

  await prisma.donation
    .update({
      where: { id },
      data: {
        status,
        amount,
        adminMemo,
        confirmedAt: status === 'CONFIRMED' ? new Date() : null,
      },
    })
    .catch(() => null);

  revalidateDonations();
  return { ok: true, message: '支援情報を更新しました。' };
}

/** 管理者：支援報告の削除（誤送信の取り消しなど） */
export async function deleteDonationAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.donation.delete({ where: { id } }).catch(() => null);
  revalidateDonations();
}
