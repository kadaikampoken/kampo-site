/**
 * lib/bank.ts
 * 振込先口座情報の取得と整形。
 * DBに未登録の場合は、要望書に記載された既定値を返す。
 */
import { prisma } from '@/lib/prisma';

export const BANK_ACCOUNT_ID = 'default';

export type BankAccountInfo = {
  bankName: string;
  branchName: string;
  branchCode: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  accountHolderKana: string | null;
  note: string | null;
};

/** 初期値（管理画面から変更できます） */
export const DEFAULT_BANK_ACCOUNT: BankAccountInfo = {
  bankName: '鹿児島銀行',
  branchName: '桜ヶ丘支店',
  branchCode: '143',
  accountType: '普通預金',
  accountNumber: '3072458',
  accountHolder: '鹿児島大学医学部漢方医学研究会',
  accountHolderKana: null,
  note: '振込手数料は恐れ入りますがご負担ください。振込後、下のフォームからご報告をお願いします。',
};

/** 現在の振込先口座を取得（未登録なら既定値） */
export async function getBankAccount(): Promise<BankAccountInfo> {
  const record = await prisma.bankAccount.findUnique({ where: { id: BANK_ACCOUNT_ID } });
  if (!record) return DEFAULT_BANK_ACCOUNT;
  return {
    bankName: record.bankName,
    branchName: record.branchName,
    branchCode: record.branchCode,
    accountType: record.accountType,
    accountNumber: record.accountNumber,
    accountHolder: record.accountHolder,
    accountHolderKana: record.accountHolderKana,
    note: record.note,
  };
}

/** 「振込先情報をコピー」で使う1つのテキストにまとめる */
export function formatBankAccountText(account: BankAccountInfo): string {
  const lines = [
    `金融機関名：${account.bankName}`,
    `支店名：${account.branchName}（支店コード ${account.branchCode}）`,
    `口座種別：${account.accountType}`,
    `口座番号：${account.accountNumber}`,
    `口座名義：${account.accountHolder}`,
  ];
  if (account.accountHolderKana) {
    lines.push(`口座名義（カナ）：${account.accountHolderKana}`);
  }
  return lines.join('\n');
}
