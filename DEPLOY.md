# デプロイ手順（GitHub → Neon → Vercel）

所要時間の目安：初回 30〜45分。

---

## 全体像

```
  ローカルPC                GitHub              Vercel              Neon
 ┌──────────┐    push    ┌────────┐  自動  ┌──────────┐  接続  ┌──────────┐
 │ kampo-site├──────────►│ リポジトリ ├──────►│ ビルド/公開 ├──────►│ PostgreSQL│
 └──────────┘           └────────┘        └──────────┘        └──────────┘
```

---

## STEP 1. Neon でデータベースを作る

1. https://neon.com にアクセスし、GitHub アカウントなどでサインアップします。
2. 「Create project」をクリックします。
   - **Project name**：`kampo-site`
   - **Postgres version**：既定のままで問題ありません
   - **Region**：`Asia Pacific (Tokyo)` など、日本から近いリージョンを選びます
3. 作成後に表示される **Connection string** を控えます。
   ダイアログ内の切り替えで2種類を取得してください。

   | 種類 | ホスト名の特徴 | 使い道 |
   | --- | --- | --- |
   | **Pooled connection** | `ep-xxxx-**pooler**.…` | `DATABASE_URL`（アプリの通常アクセス） |
   | **Direct connection** | `ep-xxxx.…`（pooler なし） | `DIRECT_URL`（マイグレーション用） |

   どちらも末尾に `?sslmode=require` が付いていることを確認します。

> **なぜ2種類必要か**：Vercel のサーバーレス環境では接続数が急増するため、通常アクセスは
> コネクションプーラー経由にします。一方 Prisma のマイグレーションはプーラー経由だと
> 失敗することがあるため、直結用のURLを分けています。

---

## STEP 2. ローカルで動作を確認する

```bash
cd kampo-site
npm install

cp .env.example .env
```

`.env` を開き、STEP 1 で控えた値を設定します。

```bash
DATABASE_URL="postgresql://…-pooler.…/neondb?sslmode=require"
DIRECT_URL="postgresql://…/neondb?sslmode=require"
AUTH_SECRET="（次のコマンドで生成した値）"
```

`AUTH_SECRET` は次のいずれかで生成します。

```bash
npx auth secret            # 推奨
# または
openssl rand -base64 32
```

続いてスキーマの反映とサンプルデータ投入を行います。

```bash
npx prisma migrate dev --name init   # マイグレーション作成＋適用
npm run db:seed                      # サンプルデータ
npm run dev                          # http://localhost:3000
```

管理者アカウント（既定 `admin@kampo-kagoshima.example.jp` / `Admin1234!`）でログインし、
`/admin` が開けることを確認してください。

---

## STEP 3. GitHub にリポジトリを作る

1. https://github.com/new でリポジトリを作成します。
   - **Repository name**：`kampo-site`
   - **Public / Private**：どちらでも可（部内運用なら Private 推奨）
   - README や .gitignore は**追加しない**（このプロジェクトに既に含まれています）

2. ローカルから push します。

```bash
cd kampo-site
git init
git add .
git commit -m "初回コミット: 鹿児島大学漢方医学研究会サイト"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/kampo-site.git
git push -u origin main
```

> ⚠️ `.env` は `.gitignore` に含まれているため push されません。
> **接続文字列や AUTH_SECRET を絶対にコミットしないでください。**
> 誤ってコミットした場合は、Neon 側でパスワードをリセットし、`AUTH_SECRET` も再生成します。

---

## STEP 4. Vercel にデプロイする

1. https://vercel.com にアクセスし、GitHub アカウントでサインアップ／ログインします。
2. **Add New… → Project** をクリックし、`kampo-site` リポジトリを **Import** します。
3. ビルド設定は自動検出されます（変更不要）。
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`（= `prisma generate && next build`）
   - Install Command: `npm install`
4. **Environment Variables** に以下を追加します（Production / Preview / Development すべてにチェック）。

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon の Pooled 接続文字列 |
   | `DIRECT_URL` | Neon の Direct 接続文字列 |
   | `AUTH_SECRET` | 生成したランダム文字列（ローカルと同じ値でも別の値でも可） |

5. **Deploy** をクリックします。数分でビルドが完了します。

> **Neon の Vercel インテグレーション**を使うと、Vercel の Marketplace から Neon を追加するだけで
> 環境変数が自動投入されます。その場合も、`DATABASE_URL` が pooled、`DIRECT_URL` が direct に
> なっているかを必ず確認してください。

---

## STEP 5. 本番DBの初期化

Vercel のビルドではマイグレーションは実行されません。ローカルから本番DBへ適用します。

```bash
# .env の DATABASE_URL / DIRECT_URL が本番(Neon)を指していることを確認したうえで
npx prisma migrate deploy
```

初期の管理者アカウントを作る方法は2つあります。

**方法A：seed を1回だけ実行する（データが空の場合のみ）**

```bash
# ⚠️ seed は既存データを全削除します。本番で使うのは初回のみ。
SEED_ADMIN_EMAIL="あなたのメールアドレス" \
SEED_ADMIN_PASSWORD="十分に長いパスワード" \
npm run db:seed
```

**方法B：サイト上で会員登録し、権限を昇格する（推奨）**

1. 公開サイトの `/register` から自分のアカウントを作成します。
2. ローカルで `npx prisma studio` を実行し、`users` テーブルの自分の行の
   `role` を `USER` → `ADMIN` に変更して保存します。
3. 一度ログアウトして再ログインすると、`/admin` にアクセスできます。

---

## STEP 6. 動作確認チェックリスト

デプロイ後、以下を確認してください。

- [ ] トップページが表示される
- [ ] `/news`, `/events`, `/crowdfunding`, `/history` が表示される
- [ ] 会員登録 → 自動ログイン → `/mypage` が表示される
- [ ] イベント詳細で参加登録 → マイページに反映される
- [ ] 一般会員のまま `/admin` にアクセスするとマイページへリダイレクトされる
- [ ] 管理者で `/admin` の各画面が開き、作成・編集・削除ができる
- [ ] 参加者管理から CSV がダウンロードでき、Excel で文字化けしない
- [ ] 存在しないURL（例：`/news/xxxx`）で 404 ページが表示される
- [ ] スマートフォン幅でハンバーガーメニューが動作する

---

## 独自ドメインを設定する場合

1. Vercel のプロジェクト → **Settings → Domains** で独自ドメインを追加します。
2. 表示された DNS レコード（A または CNAME）をドメイン管理会社側で設定します。
3. 反映後、Vercel が自動で SSL 証明書を発行します。
4. 認証のリダイレクト先が意図と異なる場合のみ、環境変数 `AUTH_URL` に
   `https://（独自ドメイン）` を設定して再デプロイします。

---

## 運用時のポイント

- **更新フロー**：`main` ブランチに push すると自動で本番反映されます。
  試したい変更は別ブランチで push し、Vercel が発行する Preview URL で確認してから
  Pull Request をマージしてください。
- **スキーマ変更時**：`prisma/schema.prisma` を編集 → `npx prisma migrate dev --name 変更内容`
  → コミット & push → 本番へ `npx prisma migrate deploy`。
- **Neon の無料プラン**：一定時間アクセスがないとDBが自動停止（スケール to ゼロ）します。
  停止後の最初のアクセスは数百ms〜数秒遅くなりますが、正常な挙動です。
- **バックアップ**：Neon のブランチ機能／PITR を利用するか、定期的に
  `pg_dump` を取得してください。

---

## よくあるトラブル

| 症状 | 原因と対処 |
| --- | --- |
| ビルドが `@prisma/client did not initialize yet` で失敗する | `npm run build` が `prisma generate` を含んでいるか確認。Vercel の Build Command を上書きしていないかチェック |
| `Can't reach database server` | `DATABASE_URL` の末尾に `?sslmode=require` があるか、Neon プロジェクトが削除されていないか確認 |
| マイグレーションが途中で止まる | プーラー経由になっている可能性。`DIRECT_URL` に direct 接続文字列を設定 |
| ログインしても弾かれる | `AUTH_SECRET` が未設定、または環境ごとに値が異なっている。Vercel の環境変数を確認し再デプロイ |
| 本番でスタイルが当たらない | `tailwind.config.ts` の `content` にファイルパスが含まれているか確認 |
| CSVがExcelで文字化けする | 本実装はUTF-8 BOM付きで出力しています。それでも崩れる場合はGoogleスプレッドシートで開いてください |
