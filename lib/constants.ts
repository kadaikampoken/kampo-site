/**
 * lib/constants.ts
 * 表示ラベル・定数
 */
import type { NewsCategory, ProjectStatus, AttendanceStatus, Role } from '@prisma/client';

export const SITE_NAME = '鹿児島大学漢方医学研究会';
export const SITE_DESCRIPTION =
  '鹿児島大学の学生を中心に、漢方医学・東洋医学を学ぶ学生団体です。定例勉強会、生薬見学会、地域健康講座などを行っています。';
export const CONTACT_EMAIL = 'contact@kampo-kagoshima.example.jp';

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

export const ROLE_LABEL: Record<Role, string> = {
  USER: '一般会員',
  ADMIN: '管理者',
};
