/**
 * app/api/admin/participants/export/route.ts
 * 参加者一覧のCSVエクスポート（管理者のみ）
 * middleware の matcher は /api を除外しているため、ここで必ず権限チェックを行う。
 */
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/auth-guard';
import { ATTENDANCE_LABEL } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

/** CSVインジェクション対策を含むエスケープ */
function csvCell(value: string | null | undefined): string {
  const v = (value ?? '').replace(/\r?\n/g, ' ');
  // =, +, -, @ で始まる値は表計算ソフトで数式として解釈されるため無害化する
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const guard = await assertAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') ?? undefined;

  const attendances = await prisma.eventAttendance.findMany({
    where: eventId ? { eventId } : {},
    orderBy: [{ event: { startsAt: 'desc' } }, { createdAt: 'asc' }],
    include: {
      user: { select: { name: true, email: true, affiliation: true } },
      event: { select: { title: true, startsAt: true } },
    },
  });

  const header = ['イベント名', '開催日時', '氏名', 'メールアドレス', '所属', '参加状況', '連絡事項', '登録日時'];

  const rows = attendances.map((a) =>
    [
      csvCell(a.event.title),
      csvCell(formatDateTime(a.event.startsAt)),
      csvCell(a.user.name),
      csvCell(a.user.email),
      csvCell(a.user.affiliation),
      csvCell(ATTENDANCE_LABEL[a.status]),
      csvCell(a.note),
      csvCell(formatDateTime(a.createdAt)),
    ].join(',')
  );

  const csv = [header.map(csvCell).join(','), ...rows].join('\r\n');
  // Excel で文字化けしないよう BOM を付与
  const body = `﻿${csv}`;

  const filename = `participants-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
