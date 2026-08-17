/**
 * components/admin/flash.tsx
 * ?created=1 などのクエリに応じて成功メッセージを表示する
 */
import { Alert } from '@/components/ui/alert';

const MESSAGES: Record<string, string> = {
  created: '新規作成しました。',
  updated: '内容を更新しました。',
  deleted: '削除しました。',
};

export function Flash({ params }: { params: Record<string, string | undefined> }) {
  const key = Object.keys(MESSAGES).find((k) => params[k] === '1');
  if (!key) return null;
  return (
    <Alert tone="success" className="mb-6">
      {MESSAGES[key]}
    </Alert>
  );
}
