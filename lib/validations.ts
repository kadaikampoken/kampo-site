/**
 * lib/validations.ts
 * Zod によるフォーム入力バリデーション定義（項目17）
 * サーバーアクションで必ず parse してから DB に渡す。
 */
import { z } from 'zod';
import {
  NewsCategory,
  ProjectStatus,
  AttendanceStatus,
  Role,
  DonationStatus,
  DonorDisclosure,
} from '@prisma/client';

/* ------------------------------------------------------------------ */
/* 共通ヘルパー                                                        */
/* ------------------------------------------------------------------ */

/** FormData の空文字を undefined に変換する（任意項目用） */
export const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

/** FormData の空文字を null に変換する */
export const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v;

/** "on" / "true" / "1" を boolean に変換 */
export const checkbox = z.preprocess(
  (v) => v === 'on' || v === 'true' || v === true || v === '1',
  z.boolean()
);

/** 数値文字列 → number */
const numberFromString = (message: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? (v.trim() === '' ? undefined : Number(v)) : v),
    z.number({ invalid_type_error: message, required_error: message })
  );

/** 日時文字列 → Date */
const dateFromString = (message: string) =>
  z.preprocess((v) => {
    if (typeof v !== 'string' || v.trim() === '') return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }, z.date({ invalid_type_error: message, required_error: message }));

/** 任意の日時文字列 → Date | null */
const optionalDateFromString = z.preprocess((v) => {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}, z.date().nullable());

/** 任意の整数（空欄は null） */
const optionalIntFromString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v === null ? null : Number(v)),
  z.number().int({ message: '整数で入力してください' }).nullable()
);

/** 任意のURL（空文字はnull） */
const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().url({ message: '正しいURLを入力してください' }).nullable()
);

/* ------------------------------------------------------------------ */
/* 認証                                                                */
/* ------------------------------------------------------------------ */

export const passwordSchema = z
  .string()
  .min(8, { message: 'パスワードは8文字以上で入力してください' })
  .max(72, { message: 'パスワードは72文字以内で入力してください' })
  .regex(/[A-Za-z]/, { message: 'パスワードには英字を1文字以上含めてください' })
  .regex(/[0-9]/, { message: 'パスワードには数字を1文字以上含めてください' });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'メールアドレスを入力してください' })
    .email({ message: 'メールアドレスの形式が正しくありません' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'お名前を入力してください' })
      .max(50, { message: 'お名前は50文字以内で入力してください' }),
    email: z
      .string()
      .min(1, { message: 'メールアドレスを入力してください' })
      .email({ message: 'メールアドレスの形式が正しくありません' })
      .max(255),
    affiliation: z.preprocess(
      emptyToNull,
      z.string().max(100, { message: '所属は100文字以内で入力してください' }).nullable()
    ),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, { message: '確認用パスワードを入力してください' }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'パスワードが一致しません',
    path: ['passwordConfirm'],
  });

export const profileSchema = z.object({
  name: z.string().min(1, { message: 'お名前を入力してください' }).max(50),
  affiliation: z.preprocess(emptyToNull, z.string().max(100).nullable()),
  bio: z.preprocess(
    emptyToNull,
    z.string().max(500, { message: '自己紹介は500文字以内で入力してください' }).nullable()
  ),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: '現在のパスワードを入力してください' }),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string().min(1, { message: '確認用パスワードを入力してください' }),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: 'パスワードが一致しません',
    path: ['newPasswordConfirm'],
  });

/* ------------------------------------------------------------------ */
/* 広報                                                                */
/* ------------------------------------------------------------------ */

export const newsSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'タイトルを入力してください' })
    .max(120, { message: 'タイトルは120文字以内で入力してください' }),
  excerpt: z
    .string()
    .min(1, { message: '概要を入力してください' })
    .max(200, { message: '概要は200文字以内で入力してください' }),
  content: z.string().min(1, { message: '本文を入力してください' }),
  category: z.nativeEnum(NewsCategory, {
    errorMap: () => ({ message: 'カテゴリを選択してください' }),
  }),
  coverImage: optionalUrl,
  published: checkbox,
  /** 公開開始日時。空欄なら保存時＝即時公開 */
  publishedAt: optionalDateFromString,
});

/* ------------------------------------------------------------------ */
/* クラウドファンディング                                              */
/* ------------------------------------------------------------------ */

export const projectSchema = z
  .object({
    title: z.string().min(1, { message: 'タイトルを入力してください' }).max(120),
    summary: z.string().min(1, { message: '概要を入力してください' }).max(200),
    description: z.string().min(1, { message: '本文を入力してください' }),
    /** 支援を募集する目的（任意） */
    purpose: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
    /** 支援金の用途（任意） */
    fundUsage: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
    coverImage: optionalUrl,
    /** 目標金額。未設定可 */
    goalAmount: optionalIntFromString.refine((v) => v === null || v >= 1000, {
      message: '目標金額は1,000円以上で入力してください（設定しない場合は空欄）',
    }),
    currentAmount: numberFromString('支援額を数値で入力してください').refine((v) => v >= 0, {
      message: '支援額は0円以上で入力してください',
    }),
    supporterCount: numberFromString('支援者数を数値で入力してください').refine((v) => v >= 0, {
      message: '支援者数は0人以上で入力してください',
    }),
    status: z.nativeEnum(ProjectStatus, {
      errorMap: () => ({ message: 'ステータスを選択してください' }),
    }),
    /** 募集期間。未設定可 */
    startDate: optionalDateFromString,
    endDate: optionalDateFromString,
    /** 振込による支援の受付を有効にするか */
    acceptingSupport: checkbox,
    externalUrl: optionalUrl,
    /** 公開開始日時。空欄なら即時公開 */
    publishAt: optionalDateFromString,
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: '終了日は開始日以降の日付を指定してください',
    path: ['endDate'],
  });

/* ------------------------------------------------------------------ */
/* イベント                                                            */
/* ------------------------------------------------------------------ */

export const eventSchema = z
  .object({
    title: z.string().min(1, { message: 'タイトルを入力してください' }).max(120),
    summary: z.string().min(1, { message: '概要を入力してください' }).max(200),
    description: z.string().min(1, { message: '詳細を入力してください' }),
    coverImage: optionalUrl,
    location: z.string().min(1, { message: '開催場所を入力してください' }).max(120),
    startsAt: dateFromString('開始日時を入力してください'),
    endsAt: optionalDateFromString,
    capacity: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? null : v === null ? null : Number(v)),
      z
        .number()
        .int({ message: '定員は整数で入力してください' })
        .min(1, { message: '定員は1人以上で入力してください' })
        .nullable()
    ),
    deadline: optionalDateFromString,
    published: checkbox,
    /** 公開開始日時。空欄なら即時公開 */
    publishAt: optionalDateFromString,
  })
  .refine((d) => !d.endsAt || d.endsAt >= d.startsAt, {
    message: '終了日時は開始日時以降を指定してください',
    path: ['endsAt'],
  })
  .refine((d) => !d.deadline || d.deadline <= d.startsAt, {
    message: '申込締切は開始日時以前を指定してください',
    path: ['deadline'],
  });

export const attendanceSchema = z.object({
  eventId: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus, {
    errorMap: () => ({ message: '参加状況を選択してください' }),
  }),
  note: z.preprocess(
    emptyToNull,
    z.string().max(200, { message: '連絡事項は200文字以内で入力してください' }).nullable()
  ),
});

/* ------------------------------------------------------------------ */
/* 年表                                                                */
/* ------------------------------------------------------------------ */

export const timelineSchema = z.object({
  year: numberFromString('年（西暦）を入力してください')
    .refine((v) => Number.isInteger(v), { message: '年は整数で入力してください' })
    .refine((v) => v >= 1900 && v <= 2200, { message: '年は1900〜2200の範囲で入力してください' }),
  month: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v === null ? null : Number(v)),
    z
      .number()
      .int({ message: '月は整数で入力してください' })
      .min(1, { message: '月は1〜12で入力してください' })
      .max(12, { message: '月は1〜12で入力してください' })
      .nullable()
  ),
  title: z.string().min(1, { message: 'タイトルを入力してください' }).max(120),
  summary: z.string().min(1, { message: '概要を入力してください' }).max(200),
  body: z.string().min(1, { message: '本文を入力してください' }),
  coverImage: optionalUrl,
  published: checkbox,
});

/* ------------------------------------------------------------------ */
/* ユーザー管理（管理者用）                                            */
/* ------------------------------------------------------------------ */

export const userRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: '権限を選択してください' }) }),
});

/* ------------------------------------------------------------------ */
/* クラウドファンディング：振込完了フォーム（一般公開）                */
/* ------------------------------------------------------------------ */

export const donationReportSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'お名前を入力してください' })
      .max(60, { message: 'お名前は60文字以内で入力してください' }),
    email: z
      .string()
      .min(1, { message: 'メールアドレスを入力してください' })
      .email({ message: 'メールアドレスの形式が正しくありません' })
      .max(255),
    projectId: z.preprocess(emptyToNull, z.string().nullable()),
    amount: numberFromString('支援金額を数値で入力してください')
      .refine((v) => Number.isInteger(v), { message: '支援金額は整数で入力してください' })
      .refine((v) => v >= 1, { message: '支援金額は1円以上で入力してください' })
      .refine((v) => v <= 100_000_000, { message: '金額が大きすぎます。内容をご確認ください' }),
    transferName: z
      .string()
      .min(1, { message: '振込名義を入力してください' })
      .max(60, { message: '振込名義は60文字以内で入力してください' }),
    transferDate: dateFromString('振込日を入力してください'),
    disclosure: z.nativeEnum(DonorDisclosure, {
      errorMap: () => ({ message: '支援者名の公開設定を選択してください' }),
    }),
    displayName: z.preprocess(
      emptyToNull,
      z.string().max(60, { message: '掲載希望名は60文字以内で入力してください' }).nullable()
    ),
    note: z.preprocess(
      emptyToNull,
      z.string().max(1000, { message: '備考は1000文字以内で入力してください' }).nullable()
    ),
  })
  .refine((d) => d.disclosure !== 'CUSTOM_NAME' || Boolean(d.displayName), {
    message: '掲載を希望するお名前を入力してください',
    path: ['displayName'],
  })
  .refine((d) => d.transferDate <= new Date(Date.now() + 24 * 60 * 60 * 1000), {
    message: '振込日に未来の日付は指定できません',
    path: ['transferDate'],
  });

/* ------------------------------------------------------------------ */
/* クラウドファンディング：管理者操作                                  */
/* ------------------------------------------------------------------ */

export const donationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(DonationStatus, {
    errorMap: () => ({ message: '状態を選択してください' }),
  }),
});

export const donationAdminSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(DonationStatus),
  amount: numberFromString('支援金額を数値で入力してください').refine((v) => v >= 0, {
    message: '支援金額は0円以上で入力してください',
  }),
  adminMemo: z.preprocess(emptyToNull, z.string().max(500).nullable()),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, { message: '金融機関名を入力してください' }).max(60),
  branchName: z.string().min(1, { message: '支店名を入力してください' }).max(60),
  branchCode: z
    .string()
    .min(1, { message: '支店コードを入力してください' })
    .max(10)
    .regex(/^[0-9]+$/, { message: '支店コードは数字で入力してください' }),
  accountType: z.string().min(1, { message: '口座種別を入力してください' }).max(20),
  accountNumber: z
    .string()
    .min(1, { message: '口座番号を入力してください' })
    .max(20)
    .regex(/^[0-9]+$/, { message: '口座番号は数字で入力してください' }),
  accountHolder: z.string().min(1, { message: '口座名義を入力してください' }).max(100),
  accountHolderKana: z.preprocess(emptyToNull, z.string().max(100).nullable()),
  note: z.preprocess(emptyToNull, z.string().max(500).nullable()),
});

export const monthlyConfirmSchema = z.object({
  year: numberFromString('年を入力してください')
    .refine((v) => Number.isInteger(v), { message: '年は整数で入力してください' })
    .refine((v) => v >= 2000 && v <= 2200, { message: '年は2000〜2200で入力してください' }),
  month: numberFromString('月を入力してください')
    .refine((v) => Number.isInteger(v), { message: '月は整数で入力してください' })
    .refine((v) => v >= 1 && v <= 12, { message: '月は1〜12で入力してください' }),
});

/* ------------------------------------------------------------------ */
/* サーバーアクションの戻り値の共通型                                  */
/* ------------------------------------------------------------------ */

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
  /** 入力値の再表示用 */
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

/** ZodError → FieldErrors */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  return error.flatten().fieldErrors as FieldErrors;
}

/** FormData → プレーンオブジェクト（再表示用） */
export function formDataToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && key !== 'password' && key !== 'passwordConfirm') {
      out[key] = value;
    }
  }
  return out;
}
