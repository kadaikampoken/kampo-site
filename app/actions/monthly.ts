'use server';

/**
 * app/actions/monthly.ts
 * 月次集計の確定と、公開用の累計金額への反映（管理者のみ）。
 *
 * 運用フロー：
 *   1. 支援者が振込完了フォームを送信 → status = REPORTED（入金未確認）
 *   2. 管理者が通帳・ネットバンキングで入金を確認 → status = CONFIRMED
 *   3. 月末に「月次集計を確定」を実行 → MonthlySummary を作成／更新
 *   4. 各プロジェクトの公開用累計（currentAmount / supporterCount）へ自動反映
 */
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import { aggregateConfirmedDonations, projectKeyOf } from '@/lib/donations';
import {
  monthlyConfirmSchema,
  toFieldErrors,
  type ActionState,
} from '@/lib/validations';

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/crowdfunding');
  revalidatePath('/crowdfunding/results');
  revalidatePath('/admin/monthly');
  revalidatePath('/admin/crowdfunding');
  revalidatePath('/admin');
}

/**
 * 各プロジェクトの公開用の累計を、公開済み月次集計から再計算する。
 * 「支援者数」は各月の実人数の合計（＝延べ人数）として扱う。
 */
async function recomputeProjectTotals(): Promise<void> {
  const projects = await prisma.project.findMany({ select: { id: true } });

  for (const project of projects) {
    const rows = await prisma.monthlySummary.findMany({
      where: { published: true, projectKey: project.id },
      select: { totalAmount: true, uniqueSupporterCount: true },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        currentAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
        supporterCount: rows.reduce((s, r) => s + r.uniqueSupporterCount, 0),
      },
    });
  }
}

/**
 * 指定した年月の入金確認済み支援を集計し、月次実績として確定する。
 * サイト全体（projectKey = "ALL"）と、プロジェクトごとの行を作成／更新する。
 */
export async function confirmMonthlySummaryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, message: guard.message };

  const parsed = monthlyConfirmSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  const { year, month } = parsed.data;

  // --- サイト全体 ---
  const overall = await aggregateConfirmedDonations(year, month, null);
  await prisma.monthlySummary.upsert({
    where: { year_month_projectKey: { year, month, projectKey: 'ALL' } },
    create: {
      year,
      month,
      projectId: null,
      projectKey: 'ALL',
      ...overall,
      published: true,
      confirmedAt: new Date(),
    },
    update: { ...overall, confirmedAt: new Date() },
  });

  // --- プロジェクトごと ---
  const projects = await prisma.project.findMany({ select: { id: true } });
  for (const project of projects) {
    const totals = await aggregateConfirmedDonations(year, month, project.id);

    const existing = await prisma.monthlySummary.findUnique({
      where: { year_month_projectKey: { year, month, projectKey: project.id } },
      select: { id: true },
    });

    // 支援が0件の月は、既存の行がなければ作らない（一覧が煩雑になるため）
    if (!existing && totals.donationCount === 0) continue;

    await prisma.monthlySummary.upsert({
      where: { year_month_projectKey: { year, month, projectKey: project.id } },
      create: {
        year,
        month,
        projectId: project.id,
        projectKey: project.id,
        ...totals,
        published: true,
        confirmedAt: new Date(),
      },
      update: { ...totals, confirmedAt: new Date() },
    });
  }

  await recomputeProjectTotals();
  revalidateAll();

  return {
    ok: true,
    message: `${year}年${month}月の支援実績を確定しました（支援総額 ${overall.totalAmount.toLocaleString()}円／実人数 ${overall.uniqueSupporterCount}名）。`,
  };
}

/** 月次実績の公開／非公開を切り替える */
export async function toggleMonthlyPublishedAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  const current = await prisma.monthlySummary.findUnique({
    where: { id },
    select: { published: true },
  });
  if (!current) return;

  await prisma.monthlySummary.update({
    where: { id },
    data: { published: !current.published },
  });

  await recomputeProjectTotals();
  revalidateAll();
}

/** 月次実績の削除 */
export async function deleteMonthlySummaryAction(formData: FormData): Promise<void> {
  const guard = await assertAdmin();
  if (!guard.ok) return;

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;

  await prisma.monthlySummary.delete({ where: { id } }).catch(() => null);
  await recomputeProjectTotals();
  revalidateAll();
}

/** projectKey のヘルパーを再エクスポート（管理画面で使用） */
export async function getProjectKey(projectId: string | null): Promise<string> {
  return projectKeyOf(projectId);
}
