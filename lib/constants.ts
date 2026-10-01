/**
 * lib/constants.ts
 * 表示ラベル・定数
 */
import type {
  NewsCategory,
  ProjectStatus,
  AttendanceStatus,
  Role,
  DonationStatus,
  DonorDisclosure,
} from '@prisma/client';

export const SITE_NAME = '鹿児島大学漢方医学研究会';
export const SITE_DESCRIPTION =
  '鹿児島大学の学生を中心に、漢方医学・東洋医学を学ぶ学生団体です。定例勉強会、生薬見学会、地域健康講座などを行っています。';
export const CONTACT_EMAIL = 'contact@kampo-kagoshima.example.jp';

/**
 * トップページの数値表示（ここを書き換えるだけで反映されます）
 */
export const SITE_STATS = {
  /**
   * 会員数。
   *   数値を入れる  → その数値をそのまま表示（例: 60）
   *   null を入れる → サイトに登録されているユーザー数を自動集計して表示
   */
  memberCount: null as number | null,

  /** 発足年（西暦）。活動年数は「今年 − この値」で自動計算されます */
  foundedYear: 2016,
} as const;

/** 一覧ページの1ページあたり件数 */
export const PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 20;

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  ANNOUNCEMENT: 'お知らせ',
  REPORT: '活動報告',
  MEDIA: 'メディア掲載',
  RECRUIT: '新歓・募集',
};

export const NEWS_CATEGORY_OPTIONS = Object.entries(NEWS_CATEGORY_LABEL).map(
  ([value, label]) => ({ value: value as NewsCategory, label })
);

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: '準備中',
  ACTIVE: '募集中',
  SUCCEEDED: '目標達成',
  CLOSED: '終了',
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABEL).map(
  ([value, label]) => ({ value: value as ProjectStatus, label })
);

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  ATTENDING: '参加',
  NOT_ATTENDING: '不参加',
};

/* ------------------------------------------------------------------ */
/* クラウドファンディング（支援）                                      */
/* ------------------------------------------------------------------ */

export const DONATION_STATUS_LABEL: Record<DonationStatus, string> = {
  REPORTED: '入金未確認',
  CONFIRMED: '入金確認済み',
  VOID: '確認不要／無効',
};

export const DONATION_STATUS_OPTIONS = Object.entries(DONATION_STATUS_LABEL).map(
  ([value, label]) => ({ value: value as DonationStatus, label })
);

export const DONATION_STATUS_TONE = {
  REPORTED: 'amber',
  CONFIRMED: 'green',
  VOID: 'gray',
} as const;

export const DONOR_DISCLOSURE_LABEL: Record<DonorDisclosure, string> = {
  REAL_NAME: '実名で掲載',
  CUSTOM_NAME: '指定した名前で掲載',
  ANONYMOUS: '匿名（掲載しない）',
};

export const DONOR_DISCLOSURE_OPTIONS = Object.entries(DONOR_DISCLOSURE_LABEL).map(
  ([value, label]) => ({ value: value as DonorDisclosure, label })
);

export const ROLE_LABEL: Record<Role, string> = {
  USER: '一般会員',
  SUPPORTER: 'サポーター',
  ADMIN: '管理者',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  USER: 'イベントへの参加登録、会員一覧の閲覧ができます。',
  SUPPORTER: 'イベントを作成し、自分が作成したイベントのみ編集・削除できます。',
  ADMIN: 'すべての管理機能を利用できます。',
};

export const ROLE_TONE = {
  USER: 'gray',
  SUPPORTER: 'blue',
  ADMIN: 'green',
} as const;
