/**
 * lib/validations.ts
 * Zod によるフォーム入力バリデーション定義（項目17）
 * サーバーアクションで必ず parse してから DB に渡す。
 */
import { z } from 'zod';
import { NewsCategory, ProjectStatus, AttendanceStatus, Role } from '@prisma/client';

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
});

/* ------------------------------------------------------------------ */
/* クラウドファンディング                                              */
/* ------------------------------------------------------------------ */

export const projectSchema = z
  .object({
    title: z.string().min(1, { message: 'タイトルを入力してください' }).max(120),
    summary: z.string().min(1, { message: '概要を入力してください' }).max(200),
    description: z.string().min(1, { message: '本文を入力してください' }),
    coverImage: optionalUrl,
    goalAmount: numberFromString('目標金額を数値で入力してください')
      .refine((v) => Number.isInteger(v), { message: '目標金額は整数で入力してください' })
      .refine((v) => v >= 1000, { message: '目標金額は1,000円以上で入力してください' }),
    currentAmount: numberFromString('支援額を数値で入力してください').refine((v) => v >= 0, {
      message: '支援額は0円以上で入力してください',
    }),
    supporterCount: numberFromString('支援者数を数値で入力してください').refine((v) => v >= 0, {
      message: '支援者数は0人以上で入力してください',
    }),
    status: z.nativeEnum(ProjectStatus, {
      errorMap: () => ({ message: 'ステータスを選択してください' }),
    }),
    startDate: dateFromString('開始日を入力してください'),
    endDate: dateFromString('終了日を入力してください'),
    externalUrl: optionalUrl,
  })
  .refine((d) => d.endDate >= d.startDate, {
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
