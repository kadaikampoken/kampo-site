/**
 * lib/donations.ts
 * 支援金の集計ロジック。
 *
 * 公開ページに出す数値は「管理者が月末に確定した MonthlySummary」だけを使う。
 * 未確認の振込報告や、個人ごとの支援金額は一般公開しない（プライバシー要件）。
 */
import type { DonorDisclosure } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/** MonthlySummary の projectKey を作る（null = サイト全体） */
export function projectKeyOf(projectId: string | null | undefined): string {
  return projectId ?? 'ALL';
}

export type PeriodTotals = {
  totalAmount: number;
  /** 延べ件数 */
  donationCount: number;
  /** 実人数（メールアドレス単位） */
  uniqueSupporterCount: number;
};

/** 指定した年月の入金確認済み支援を集計する（管理者の月次確定で使用） */
export async function aggregateConfirmedDonations(
  year: number,
  month: number,
  projectId: string | null
): Promise<PeriodTotals> {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);

  const donations = await prisma.donation.findMany({
    where: {
      status: 'CONFIRMED',
      transferDate: { gte: start, lt: end },
      ...(projectId ? { projectId } : {}),
    },
    select: { amount: true, email: true },
  });

  const emails = new Set(donations.map((d) => d.email.toLowerCase()));

  return {
    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
    donationCount: donations.length,
    uniqueSupporterCount: emails.size,
  };
}

/** 公開済みの月次集計から累計を算出する */
export async function getPublishedTotals(projectId: string | null): Promise<PeriodTotals> {
  const rows = await prisma.monthlySummary.findMany({
    where: { published: true, projectKey: projectKeyOf(projectId) },
    select: { totalAmount: true, donationCount: true, uniqueSupporterCount: true },
  });

  return {
    totalAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
    donationCount: rows.reduce((s, r) => s + r.donationCount, 0),
    // 実人数は月をまたぐと重複しうるため、累計では「延べ」ではなく各月の実人数の合計。
    // 表示側で「延べ人数」と明記する。
    uniqueSupporterCount: rows.reduce((s, r) => s + r.uniqueSupporterCount, 0),
  };
}

/**
 * 公開ページに掲載する支援者名の一覧。
 * 掲載を許可した人（REAL_NAME / CUSTOM_NAME）のみを返し、匿名希望は件数だけ返す。
 * 金額・メールアドレス・振込名義は一切返さない。
 */
export async function getPublicSupporterNames(
  year: number,
  month: number,
  projectId?: string | null
): Promise<{ names: string[]; anonymousCount: number }> {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);

  const donations = await prisma.donation.findMany({
    where: {
      status: 'CONFIRMED',
      transferDate: { gte: start, lt: end },
      ...(projectId ? { projectId } : {}),
    },
    // 公開に必要な最小限の項目だけを取得する
    select: { name: true, displayName: true, disclosure: true },
    orderBy: { transferDate: 'asc' },
  });

  const names: string[] = [];
  let anonymousCount = 0;

  for (const d of donations) {
    const label = publicDonorName(d);
    if (label) names.push(label);
    else anonymousCount += 1;
  }

  // 同一人物が複数回支援した場合は名前を1回だけ表示する
  return { names: Array.from(new Set(names)), anonymousCount };
}

/** 掲載名を決める。匿名なら null */
export function publicDonorName(donation: {
  name: string;
  displayName: string | null;
  disclosure: DonorDisclosure;
}): string | null {
  if (donation.disclosure === 'REAL_NAME') return donation.name;
  if (donation.disclosure === 'CUSTOM_NAME') return donation.displayName || null;
  return null;
}

/** 年月の候補（公開済みの集計がある年月を新しい順に） */
export async function getSummaryMonths(): Promise<{ year: number; month: number }[]> {
  const rows = await prisma.monthlySummary.findMany({
    where: { published: true, projectKey: 'ALL' },
    select: { year: true, month: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return rows;
}
