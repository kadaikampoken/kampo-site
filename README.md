# 鹿児島大学漢方医学研究会 公式サイト

Next.js 15（App Router）+ TypeScript + Tailwind CSS + Prisma + Neon(PostgreSQL) + Auth.js v5 で構築した、
学生団体向けの公式サイト兼会員管理システムです。

---

## 目次

- [機能一覧](#機能一覧)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [ローカル環境の構築](#ローカル環境の構築)
- [環境変数](#環境変数)
- [データベース設計](#データベース設計)
- [権限とアクセス制御](#権限とアクセス制御)
- [セキュリティ上の設計](#セキュリティ上の設計)
- [実装していない機能と代替案](#実装していない機能と代替案)
- [デプロイ手順](#デプロイ手順)

---

## 機能一覧

### 公開ページ

| ページ | パス | 内容 |
| --- | --- | --- |
| ホーム | `/` | ヒーロー、活動紹介、直近イベント、広報、CF、年表プレビュー |
| 広報一覧 | `/news` | カテゴリ絞り込み・ページネーション |
| 広報詳細 | `/news/[id]` | 本文表示、前後記事へのリンク |
| クラウドファンディング一覧 | `/crowdfunding` | 募集中／終了で区分、累計支援額サマリー |
| クラウドファンディング詳細 | `/crowdfunding/[id]` | 達成率バー、外部支援ページへの導線 |
| イベント一覧 | `/events` | 開催予定／過去のタブ、自分の登録状況を表示 |
| イベント詳細 | `/events/[id]` | 開催情報、**参加・不参加の登録**（要ログイン） |
| 年表 | `/history` | 年ごとにグルーピングした縦型タイムライン |
| 年表詳細 | `/history/[id]` | 詳細本文、前後のできごとへのリンク |
| ログイン | `/login` | メールアドレス＋パスワード |
| 会員登録 | `/register` | 登録後そのままログイン |
| マイページ | `/mypage` | 参加予定・参加履歴、プロフィール編集、パスワード変更 |

### 管理画面（`ADMIN` 権限のみ）

| ページ | パス | 内容 |
| --- | --- | --- |
| ダッシュボード | `/admin` | 各種件数の集計、直近の更新一覧 |
| 広報管理 | `/admin/news` | 一覧・作成・編集・削除、公開/下書きのワンクリック切替 |
| CF管理 | `/admin/crowdfunding` | 一覧・作成・編集・削除、支援額の手動更新 |
| イベント管理 | `/admin/events` | 一覧・作成・編集・削除 |
| 参加者管理 | `/admin/participants` | イベント別・状況別の絞り込み、**CSVエクスポート** |
| 年表管理 | `/admin/history` | 一覧・作成・編集・削除 |
| ユーザー管理 | `/admin/users` | 検索、権限変更、削除 |

### 共通UI

Header（現在地ハイライト／モバイルメニュー）、Footer、Loading（スケルトン含む）、
Empty State、Error境界、404ページ、ページネーション、パンくずリスト。

---

## 技術スタック

| 分類 | 採用技術 | バージョン |
| --- | --- | --- |
| フレームワーク | Next.js（App Router） | 15.5.x |
| 言語 | TypeScript | 5.7 |
| UI | React / Tailwind CSS | 19 / 3.4 |
| ORM | Prisma | 6.19 |
| DB | Neon (PostgreSQL) | — |
| 認証 | Auth.js (NextAuth) v5 | 5.0.0-beta.29 |
| バリデーション | Zod | 3.25 |
| パスワードハッシュ | bcryptjs | 2.4 |
| ホスティング | Vercel | — |

データ更新はすべて **Server Actions** で実装しており、独自の REST API は
CSVエクスポート（`/api/admin/participants/export`）と Auth.js のエンドポイントのみです。

---

## ディレクトリ構成

```
kampo-site/
├── app/
│   ├── actions/                 # Server Actions（データ更新の入口）
│   │   ├── auth.ts              # ログイン／登録／プロフィール／パスワード
│   │   ├── news.ts              # 広報 CRUD
│   │   ├── crowdfunding.ts      # CF CRUD
│   │   ├── events.ts            # イベント CRUD ＋ 参加/不参加
│   │   ├── timeline.ts          # 年表 CRUD
│   │   └── users.ts             # ユーザー権限変更・削除
│   ├── admin/                   # 管理画面（layout.tsx で requireAdmin）
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Auth.js エンドポイント
│   │   └── admin/participants/export/  # CSV出力
│   ├── crowdfunding/ events/ history/ news/
│   ├── login/ register/ mypage/
│   ├── layout.tsx  page.tsx  loading.tsx  error.tsx  not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # Button, Badge, Card, フォーム部品, Alert, Pagination …
│   ├── layout/                  # Header, Footer, NavLink, MobileNav
│   ├── common/                  # PageHeader, EmptyState, Loading, ArticleBody
│   ├── cards/                   # NewsCard, ProjectCard, EventCard
│   ├── forms/                   # ログイン／登録／プロフィール
│   ├── admin/                   # 各管理フォーム, DeleteButton, AdminNav
│   └── attendance-form.tsx      # 参加・不参加登録
├── lib/
│   ├── prisma.ts                # PrismaClient シングルトン
│   ├── auth-guard.ts            # requireUser / requireAdmin / assertAdmin
│   ├── validations.ts           # Zod スキーマ一式
│   ├── constants.ts             # ラベル・定数
│   ├── nav.ts                   # ナビゲーション定義
│   └── utils.ts                 # 日付・金額フォーマットなど
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  # サンプルデータ
├── types/next-auth.d.ts         # Session / JWT の型拡張
├── auth.config.ts               # Edge対応の設定（middlewareが使用）
├── auth.ts                      # Credentials プロバイダ（Node.js専用）
├── middleware.ts                # 全リクエストの認可判定
└── tailwind.config.ts / next.config.mjs / tsconfig.json
```

---

## ローカル環境の構築

前提：Node.js 20 以上、npm。

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数ファイルの作成
cp .env.example .env
#    → DATABASE_URL / DIRECT_URL に Neon の接続文字列を設定
#    → AUTH_SECRET を生成して設定
npx auth secret          # または: openssl rand -base64 32

# 3. データベースにスキーマを反映
npm run db:push          # 開発中はこちらが手軽
# 履歴を残したい場合は
npm run db:migrate

# 4. サンプルデータの投入
npm run db:seed

# 5. 開発サーバーの起動
npm run dev
# → http://localhost:3000
```

### seed で作成されるアカウント

| 種別 | メールアドレス | パスワード |
| --- | --- | --- |
| 管理者 | `.env` の `SEED_ADMIN_EMAIL`（既定 `admin@kampo-kagoshima.example.jp`） | `.env` の `SEED_ADMIN_PASSWORD`（既定 `Admin1234!`） |
| 一般会員 | `taro@example.com` ほか3名 | `Member1234!` |

> **本番環境では必ずパスワードを変更してください。** seed は既存データを全削除するため、本番DBでは実行しないでください。

### npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | `prisma generate` → `next build` |
| `npm start` | 本番サーバー起動 |
| `npm run typecheck` | 型チェックのみ |
| `npm run db:push` | スキーマをDBへ反映（マイグレーション履歴なし） |
| `npm run db:migrate` | マイグレーション作成＆適用 |
| `npm run db:seed` | サンプルデータ投入 |
| `npm run db:studio` | Prisma Studio でデータを閲覧・編集 |

---

## 環境変数

| 変数名 | 必須 | 用途 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Neon の **Pooled** 接続文字列（アプリの通常アクセス） |
| `DIRECT_URL` | ✅ | Neon の **Direct** 接続文字列（マイグレーション用） |
| `AUTH_SECRET` | ✅ | JWT の署名鍵。32バイト以上のランダム文字列 |
| `AUTH_URL` | — | 通常不要（Vercel では自動設定）。独自ドメイン運用時のみ設定 |
| `SEED_ADMIN_EMAIL` | — | seed で作る管理者のメールアドレス |
| `SEED_ADMIN_PASSWORD` | — | seed で作る管理者のパスワード |

---

## データベース設計

| モデル | 役割 | 主なリレーション |
| --- | --- | --- |
| `User` | 会員。`role` は `USER` / `ADMIN` | `EventAttendance[]`, `News[]`(著者) |
| `News` | 広報記事。`published` / `publishedAt` で公開制御 | `User`(著者, `SetNull`) |
| `Project` | クラウドファンディング案件。`status` で公開制御 | — |
| `Event` | イベント。`capacity`, `deadline` で受付を制御 | `EventAttendance[]`(`Cascade`) |
| `EventAttendance` | 参加/不参加。`@@unique([eventId, userId])` で1人1件 | `Event`, `User`（ともに `Cascade`） |
| `TimelineEntry` | 年表。`year` / `month` で並び替え | — |

`EventAttendance` に複合ユニーク制約を張っているため、参加登録は `upsert` で
「登録」と「変更」を同じ操作として扱えます。

---

## 権限とアクセス制御

3層で検証しています（いずれか1つが破られても防げる設計）。

1. **middleware（`middleware.ts` + `auth.config.ts`）**
   - `/mypage`, `/admin` 配下は未ログインならログインページへリダイレクト（元URLを `callbackUrl` で保持）
   - `/admin` 配下は `role !== 'ADMIN'` ならマイページへリダイレクト
   - ログイン済みで `/login`, `/register` に来た場合はマイページへ
2. **ページ側（`app/admin/layout.tsx` の `requireAdmin()`）**
   - middleware をすり抜けた場合でもサーバー側で再検証
3. **Server Action / Route Handler 側（`assertAdmin()`）**
   - フォームは直接 POST できるため、**更新処理の直前で必ず権限を確認**
   - `/api/**` は middleware の matcher 対象外なので、Route Handler 内で自前チェック

---

## セキュリティ上の設計

- **パスワード**：bcrypt（cost 10）でハッシュ化して保存。平文・可逆暗号は使用していません。
  ログイン時はユーザーが存在しない場合もダミーハッシュと比較し、応答時間からアカウントの
  存在有無が推測されないようにしています。
- **セッション**：JWT を HttpOnly / Secure / SameSite=Lax な Cookie に保存（Auth.js の既定）。
  CSRF 対策は Auth.js と Next.js Server Actions の仕組みに準拠しています。
- **XSS**：`dangerouslySetInnerHTML` を一切使用していません。本文は
  `components/common/article-body.tsx` で段落に分割し、React のテキストノードとして描画します。
- **SQLインジェクション**：Prisma のクエリビルダのみを使用し、生SQLは書いていません。
- **オープンリダイレクト**：`callbackUrl` は `/` 始まり かつ `//` 始まりでないものだけを許可。
- **権限昇格**：会員登録フォームの `role` は受け付けず、サーバー側で `USER` を固定。
  自分自身の権限変更・削除は不可。管理者が0人になる操作もブロック。
- **CSVインジェクション**：`=`, `+`, `-`, `@` で始まるセルは先頭に `'` を付与して無害化。
- **入力検証**：すべてのフォームは Zod スキーマでサーバー側検証を行います。
  HTML の `required` などはあくまで補助であり、信頼していません。
- **管理画面の noindex**：`/admin` と `/mypage` は `robots: { index: false }` を設定。

---

## 実装していない機能と代替案

正直に書いておきます。以下は**本アプリの範囲外**としました。

| 機能 | 実装しなかった理由 | 代替案 |
| --- | --- | --- |
| 決済・課金 | 学生団体が自前で決済を扱うのは、特定商取引法・資金決済法・PCI DSS の観点で負担が大きすぎます | READYFOR / CAMPFIRE などの外部CFサービスへ `externalUrl` でリンク。支援額・支援者数は管理画面から手動更新 |
| 画像アップロード | Vercel のファイルシステムは書き込み不可（読み取り専用）のため、サーバーに直接保存できません | 現状は**画像URLを入力**する方式。自前アップロードが必要なら Vercel Blob / Cloudinary / S3 を導入し、`coverImage` にURLを保存してください |
| メール送信（登録確認・パスワード再設定） | SMTP または Resend / SendGrid などの外部サービスと APIキーが必要で、環境依存になります | Resend + Auth.js の Email Provider、またはパスワード再設定は管理者による手動対応 |
| リッチテキストエディタ | Markdown/HTML を受け付けるとサニタイズが必須になり、XSSリスクが増えます | プレーンテキスト＋空行での段落分割。必要なら `react-markdown` + `rehype-sanitize` を追加してください |
| 全文検索 | PostgreSQL の全文検索は日本語形態素解析の設定が別途必要です | ユーザー管理のみ `contains` による部分一致検索を実装。本格的な検索は Meilisearch / Algolia を検討 |
| 支援額の自動同期 | 外部CFサービスの公開APIが保証されていません | 管理画面からの手動更新 |
| 会員名簿の公開 | 個人情報保護の観点から公開しない設計にしています | 管理画面でのみ閲覧可能 |

---

## デプロイ手順

`DEPLOY.md` に GitHub への配置から Neon 接続、Vercel デプロイまでを手順化してあります。

---

## ライセンス / 注意

本サイトは学生団体の活動紹介を目的としたものであり、個別の疾病に関する医学的助言を行うものではありません。
掲載する文章・画像の権利については、各自でご確認のうえ運用してください。
