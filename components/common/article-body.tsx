/**
 * components/common/article-body.tsx
 * プレーンテキスト本文を段落として安全に描画する。
 * dangerouslySetInnerHTML を使わないため XSS の心配がない（項目46）。
 */
import { toParagraphs } from '@/lib/utils';

export function ArticleBody({ text }: { text: string }) {
  const paragraphs = toParagraphs(text);
  return (
    <div className="space-y-5 leading-8 text-gray-800">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap break-words">
          {p}
        </p>
      ))}
    </div>
  );
}
