/**
 * prisma/seed.ts
 * サンプルデータ投入スクリプト
 *   実行:  npm run db:seed
 */
import { PrismaClient, Role, NewsCategory, ProjectStatus, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@kampo-kagoshima.example.jp';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

function daysFromNow(days: number, hour = 18, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('--- seed 開始 ---');

  // 既存データを削除（依存関係の順序に注意）
  await prisma.eventAttendance.deleteMany();
  await prisma.event.deleteMany();
  await prisma.news.deleteMany();
  await prisma.project.deleteMany();
  await prisma.timelineEntry.deleteMany();
  await prisma.user.deleteMany();

  // ------------------------------------------------------------------
  // ユーザー
  // ------------------------------------------------------------------
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const memberHash = await bcrypt.hash('Member1234!', 10);

  const admin = await prisma.user.create({
    data: {
      name: '管理者（代表）',
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      role: Role.ADMIN,
      affiliation: '医学部医学科 5年',
      bio: '鹿児島大学漢方医学研究会 代表。',
    },
  });

  const members = await Promise.all(
    [
      { name: '山田 太郎', email: 'taro@example.com', affiliation: '医学部医学科 3年' },
      { name: '鈴木 花子', email: 'hanako@example.com', affiliation: '医学部保健学科 2年' },
      { name: '佐藤 次郎', email: 'jiro@example.com', affiliation: '歯学部歯学科 4年' },
      { name: '田中 美咲', email: 'misaki@example.com', affiliation: '医学部医学科 1年' },
    ].map((m) =>
      prisma.user.create({
        data: { ...m, passwordHash: memberHash, role: Role.USER },
      })
    )
  );
  console.log(`ユーザー: ${members.length + 1} 件`);

  // ------------------------------------------------------------------
  // 広報
  // ------------------------------------------------------------------
  const newsData = [
    {
      title: '2026年度 新入生歓迎会のお知らせ',
      excerpt:
        '漢方医学に興味のある新入生の皆さんへ。新歓説明会と体験会を開催します。学部・学科は問いません。',
      content: `鹿児島大学漢方医学研究会では、2026年度の新入生歓迎会を開催します。

【日時】4月中旬（詳細はイベントページをご確認ください）
【場所】鹿児島大学 桜ヶ丘キャンパス 講義棟
【内容】
  ・会の活動紹介
  ・生薬の実物観察会
  ・先輩との座談会
  ・お茶会（薬膳茶の試飲）

漢方に関する知識は一切不要です。「東洋医学ってなんとなく面白そう」という気持ちだけで十分です。
医学部・歯学部・保健学科はもちろん、他学部の学生も歓迎します。

参加希望の方はイベントページから参加登録をお願いします。当日参加も可能です。`,
      category: NewsCategory.RECRUIT,
      published: true,
      publishedAt: daysFromNow(-5),
    },
    {
      title: '第12回 生薬見学会を開催しました',
      excerpt:
        '製薬企業の生薬倉庫を見学し、原料生薬の鑑別実習を行いました。参加者は28名でした。',
      content: `2月8日、会員28名が参加して第12回生薬見学会を実施しました。

普段は粉末やエキス顆粒でしか目にしない生薬を、原形のまま観察・触感・香りで鑑別する実習を行いました。
特に人参（ニンジン）と党参（トウジン）の違い、桂皮の産地による香りの差は、参加者から驚きの声が上がりました。

ご協力いただいた企業の皆様に厚く御礼申し上げます。

【参加者の感想（抜粋）】
「教科書の写真と実物は全く別物だった」
「五感を使って学ぶという東洋医学の姿勢を実感した」`,
      category: NewsCategory.REPORT,
      published: true,
      publishedAt: daysFromNow(-20),
    },
    {
      title: '地域新聞に当会の活動が掲載されました',
      excerpt:
        '地域の高齢者向け健康講座「フレイル予防と養生」の取り組みが新聞に取り上げられました。',
      content: `当会が地域包括支援センターと連携して実施している健康講座について、地域紙に掲載されました。

学生が主体となり、東洋医学の「未病」「養生」の考え方を平易な言葉で紹介する取り組みが評価されました。
今後も月1回のペースで継続する予定です。`,
      category: NewsCategory.MEDIA,
      published: true,
      publishedAt: daysFromNow(-45),
    },
    {
      title: '会誌『薩摩漢方』第8号を発行しました',
      excerpt: '会員の研究報告・症例検討・特別寄稿を収録した年次会誌を発行しました。',
      content: `会誌『薩摩漢方』第8号を発行しました。

【収録内容】
  ・特別寄稿：漢方医学教育の現状と課題
  ・学生研究報告 3編
  ・症例検討会まとめ
  ・生薬見学会レポート
  ・卒業生からのメッセージ

部室にて配布しております。郵送をご希望の方はお問い合わせください。`,
      category: NewsCategory.ANNOUNCEMENT,
      published: true,
      publishedAt: daysFromNow(-70),
    },
    {
      title: '【下書き】夏合宿の企画について',
      excerpt: '検討中の内容です。公開前の下書き記事です。',
      content: '夏合宿の候補地・日程を検討中です。決まり次第お知らせします。',
      category: NewsCategory.ANNOUNCEMENT,
      published: false,
      publishedAt: null,
    },
  ];

  for (const n of newsData) {
    await prisma.news.create({ data: { ...n, authorId: admin.id } });
  }
  console.log(`広報: ${newsData.length} 件`);

  // ------------------------------------------------------------------
  // クラウドファンディング
  // ------------------------------------------------------------------
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: '学生の手で「生薬標本室」をつくりたい',
        summary:
          '実物の生薬に触れられる常設の標本室を大学内に整備し、後輩へ受け継ぐためのプロジェクトです。',
        description: `■ 私たちについて
鹿児島大学漢方医学研究会は、医学部・歯学部・保健学科の学生が集まり、東洋医学・漢方医学を学ぶサークルです。

■ 課題
漢方の学習において、実物の生薬に触れる機会は極めて限られています。
現在、当会が保有する生薬標本は約40種。一方で、医療用漢方製剤に使用される生薬は200種を超えます。

■ 実現したいこと
・生薬標本 150種の追加購入
・保管用の防湿標本ケースの設置
・標本カタログ（デジタル版）の作成と一般公開

■ 資金の使途
  標本購入費        900,000円
  標本ケース・什器  450,000円
  カタログ制作費    100,000円
  手数料等          50,000円
  合計            1,500,000円

■ リターン
  3,000円  お礼のメール＋活動報告書（PDF）
  10,000円 上記＋会誌『薩摩漢方』最新号
  30,000円 上記＋標本室の銘板にお名前を掲載
  50,000円 上記＋薬膳茶の詰め合わせ

ご支援のほど、何卒よろしくお願いいたします。`,
        goalAmount: 1_500_000,
        currentAmount: 985_000,
        supporterCount: 87,
        status: ProjectStatus.ACTIVE,
        startDate: daysFromNow(-30, 0, 0),
        endDate: daysFromNow(30, 23, 59),
        externalUrl: 'https://example.com/crowdfunding/kampo-herbarium',
      },
    }),
    prisma.project.create({
      data: {
        title: '地域の健康講座を県内全域へ届けるプロジェクト',
        summary:
          '離島・へき地を含む県内各地で「養生」をテーマにした健康講座を開催するための交通費・資料費を募ります。',
        description: `鹿児島県は離島が多く、医療資源の地域格差が課題となっています。

当会では「未病を治す」という東洋医学の考え方をもとに、地域の皆さまへ生活習慣と養生の知識を届ける講座を実施してきました。
これを県内全域、特に離島地域へ広げるため、渡航費・資料印刷費のご支援をお願いします。

■ 資金の使途
  渡航費・交通費   400,000円
  資料印刷費       120,000円
  会場費・備品      60,000円
  手数料等          20,000円
  合計             600,000円`,
        goalAmount: 600_000,
        currentAmount: 612_000,
        supporterCount: 54,
        status: ProjectStatus.SUCCEEDED,
        startDate: daysFromNow(-180, 0, 0),
        endDate: daysFromNow(-90, 23, 59),
        externalUrl: 'https://example.com/crowdfunding/kampo-community',
      },
    }),
    prisma.project.create({
      data: {
        title: '会誌『薩摩漢方』アーカイブのデジタル化',
        summary: '創刊号からのバックナンバーをデジタル化し、誰でも読める形で公開します。',
        description: `創刊号（2018年）以降の会誌をスキャン・OCR処理し、Web上で無償公開する計画です。
現在、企画内容を精査中です。公開までしばらくお待ちください。`,
        goalAmount: 300_000,
        currentAmount: 0,
        supporterCount: 0,
        status: ProjectStatus.DRAFT,
        startDate: daysFromNow(20, 0, 0),
        endDate: daysFromNow(80, 23, 59),
        externalUrl: null,
      },
    }),
  ]);
  console.log(`クラウドファンディング: ${projects.length} 件`);

  // ------------------------------------------------------------------
  // イベント
  // ------------------------------------------------------------------
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: '第43回 定例勉強会「かぜ症候群と漢方」',
        summary:
          '葛根湯・麻黄湯・桂枝湯の使い分けを、病期と証の観点から症例ベースで学びます。',
        description: `【テーマ】かぜ症候群と漢方 ― 太陽病期の方剤選択
【担当】5年 〇〇
【対象】会員・見学者ともに歓迎（予備知識不要）

■ 内容
  1. 六病位の概説（15分）
  2. 葛根湯・麻黄湯・桂枝湯・麻黄附子細辛湯の比較（30分）
  3. 症例検討（グループワーク・40分）
  4. 質疑応答

■ 持ち物
  筆記用具のみ。資料は当日配布します。`,
        location: '桜ヶ丘キャンパス 講義棟 2階 第3講義室',
        startsAt: daysFromNow(7, 18, 30),
        endsAt: daysFromNow(7, 20, 0),
        capacity: 40,
        deadline: daysFromNow(6, 23, 59),
        published: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '春の薬草園フィールドワーク',
        summary: '薬草園を巡り、季節の薬用植物を実地で観察します。屋外開催・雨天順延。',
        description: `春の薬草を実地で観察するフィールドワークです。

【集合】現地集合（詳細は参加者へ別途連絡）
【服装】歩きやすい靴・長袖・帽子を推奨
【費用】入園料 300円（当日集金）
【雨天時】翌週へ順延

例年、シャクヤク・トウキ・ミシマサイコなどを観察しています。
植物の同定に自信がなくても大丈夫です。指導員の方が解説してくださいます。`,
        location: '県立薬用植物園',
        startsAt: daysFromNow(21, 10, 0),
        endsAt: daysFromNow(21, 15, 0),
        capacity: 20,
        deadline: daysFromNow(18, 23, 59),
        published: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '新入生歓迎説明会＋薬膳茶会',
        summary:
          '新入生向けの説明会です。活動紹介のあと、薬膳茶を飲みながら先輩と気軽に話せます。',
        description: `漢方医学研究会がどんなサークルなのかを知ってもらう会です。

【対象】新入生・在学生・他学部生、どなたでも
【参加費】無料
【申込】不要（当日参加OK）ですが、人数把握のため参加登録にご協力ください

■ タイムテーブル
  17:00 開会・活動紹介
  17:20 生薬クイズ
  17:40 薬膳茶会・座談会
  18:30 閉会

途中参加・途中退出も自由です。`,
        location: '郡元キャンパス 学生会館 会議室A',
        startsAt: daysFromNow(35, 17, 0),
        endsAt: daysFromNow(35, 18, 30),
        capacity: null,
        deadline: null,
        published: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '第42回 定例勉強会「女性のライフステージと漢方」',
        summary: '月経随伴症状・更年期症状に対する当帰芍薬散などの用い方を扱いました。',
        description: `終了したイベントです。当日は32名が参加しました。
資料は部室にて配布しています。`,
        location: '桜ヶ丘キャンパス 講義棟 2階 第3講義室',
        startsAt: daysFromNow(-14, 18, 30),
        endsAt: daysFromNow(-14, 20, 0),
        capacity: 40,
        deadline: daysFromNow(-15, 23, 59),
        published: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '【非公開】幹部会ミーティング',
        summary: '運営メンバー向けの打ち合わせです。（非公開設定のサンプル）',
        description: '次年度の活動計画についての打ち合わせ。',
        location: '部室',
        startsAt: daysFromNow(10, 12, 0),
        endsAt: daysFromNow(10, 13, 0),
        capacity: 10,
        deadline: null,
        published: false,
      },
    }),
  ]);
  console.log(`イベント: ${events.length} 件`);

  // 参加登録サンプル
  await prisma.eventAttendance.createMany({
    data: [
      { eventId: events[0].id, userId: members[0].id, status: AttendanceStatus.ATTENDING, note: '15分ほど遅れます' },
      { eventId: events[0].id, userId: members[1].id, status: AttendanceStatus.ATTENDING },
      { eventId: events[0].id, userId: members[2].id, status: AttendanceStatus.NOT_ATTENDING, note: '実習と重なるため欠席します' },
      { eventId: events[1].id, userId: members[0].id, status: AttendanceStatus.ATTENDING },
      { eventId: events[1].id, userId: members[3].id, status: AttendanceStatus.ATTENDING, note: '初参加です。よろしくお願いします' },
      { eventId: events[2].id, userId: members[3].id, status: AttendanceStatus.ATTENDING },
      { eventId: events[3].id, userId: members[1].id, status: AttendanceStatus.ATTENDING },
    ],
  });
  console.log('参加登録: 7 件');

  // ------------------------------------------------------------------
  // 年表
  // ------------------------------------------------------------------
  const timeline = [
    {
      year: 2016,
      month: 4,
      title: '有志7名により発足',
      summary: '医学部の学生有志7名が「漢方勉強会」として活動を開始しました。',
      body: `2016年春、東洋医学に関心を持つ医学科の学生7名が集まり、自主ゼミ形式の勉強会として活動を始めました。

当初は月1回、教科書の輪読が中心でした。指導教員を持たない完全な学生主体の集まりで、
「西洋医学のカリキュラムでは触れられない体系をきちんと学びたい」という問題意識が出発点でした。`,
    },
    {
      year: 2017,
      month: 10,
      title: '公認サークルとして承認',
      summary: '大学から正式に学生団体として認可され、「漢方医学研究会」に改称しました。',
      body: `活動実績が認められ、大学公認の学生団体として登録されました。
これにより部室の使用、学内掲示、大学施設での勉強会開催が可能となり、活動の幅が大きく広がりました。

同時に名称を「鹿児島大学漢方医学研究会」に改めました。会員数はこの時点で23名。`,
    },
    {
      year: 2018,
      month: 3,
      title: '会誌『薩摩漢方』創刊',
      summary: '年次会誌の第1号を発行。学生の研究報告と症例検討を収録しました。',
      body: `会員の学びを形に残すため、年次会誌『薩摩漢方』を創刊しました。
創刊号には学生研究報告2編、症例検討会のまとめ、生薬に関するコラムを収録しています。

以降、毎年3月に発行を続けています。`,
    },
    {
      year: 2019,
      month: 8,
      title: '第1回 生薬見学会を実施',
      summary: '製薬企業のご協力により、原料生薬の鑑別実習を初開催しました。',
      body: `製薬企業のご厚意により、生薬倉庫の見学と鑑別実習の機会をいただきました。
以降、当会の看板行事として年2回のペースで継続しています。`,
    },
    {
      year: 2020,
      month: 5,
      title: 'オンライン勉強会へ移行',
      summary: '感染症流行下でも学びを止めないため、全面的にオンライン開催へ切り替えました。',
      body: `対面での活動が困難となった時期、勉強会をすべてオンラインに移行しました。

結果として県外・他大学の学生も参加できるようになり、むしろ参加者の裾野が広がるという
予期しない効果がありました。現在もハイブリッド開催を継続しています。`,
    },
    {
      year: 2022,
      month: 6,
      title: '地域健康講座の開始',
      summary: '地域包括支援センターと連携し、高齢者向けの養生講座を開始しました。',
      body: `「未病」「養生」という東洋医学の考え方を地域へ還元する取り組みとして、
地域包括支援センターと連携した健康講座を開始しました。

学生が講師を務め、食養生・睡眠・運動を平易な言葉で解説しています。月1回のペースで継続中です。`,
    },
    {
      year: 2024,
      month: 11,
      title: '全国学生東洋医学交流会でポスター発表',
      summary: '全国の学生団体が集う交流会に参加し、当会の活動報告と研究発表を行いました。',
      body: `全国の医療系学生が集う東洋医学交流会に会員6名が参加し、
地域健康講座の取り組みについてポスター発表を行いました。

他大学との継続的な交流のきっかけとなり、現在は合同勉強会も実施しています。`,
    },
    {
      year: 2026,
      month: 4,
      title: '会員数60名を突破',
      summary: '医学科・歯学科・保健学科に加え、他学部からの入会も増え60名を超えました。',
      body: `発足時7名だった会員は、10年目を迎えて60名を超えました。
医学科・歯学科・保健学科に加え、農学部・水産学部からの入会もあり、
生薬資源や食養生といった多様な視点が持ち込まれています。`,
    },
  ];

  for (const t of timeline) {
    await prisma.timelineEntry.create({ data: { ...t, published: true } });
  }
  console.log(`年表: ${timeline.length} 件`);

  console.log('--- seed 完了 ---');
  console.log(`管理者ログイン: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('一般ユーザー例: taro@example.com / Member1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
