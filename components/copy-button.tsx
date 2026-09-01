'use client';

/**
 * components/copy-button.tsx
 * クリップボードへのコピーボタン。
 * スマートフォンでの利用を想定し、押した直後に「コピーしました」を明示する。
 * navigator.clipboard が使えない環境（古い端末・http接続）では
 * 一時的な textarea を使った方式にフォールバックする。
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // フォールバックへ
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label,
  copiedLabel = 'コピーしました',
  variant = 'primary',
  className,
}: {
  value: string;
  label: string;
  copiedLabel?: string;
  variant?: 'primary' | 'outline';
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleClick = async () => {
    const ok = await copyText(value);
    setState(ok ? 'copied' : 'error');
    window.setTimeout(() => setState('idle'), 2500);
  };

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors',
          variant === 'primary'
            ? 'bg-kampo-700 text-white hover:bg-kampo-800'
            : 'border border-kampo-300 bg-white text-kampo-800 hover:bg-kampo-50'
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {state === 'copied' ? (
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </>
          )}
        </svg>
        {state === 'copied' ? copiedLabel : label}
      </button>

      {/* スクリーンリーダー向けの通知 */}
      <p aria-live="polite" className="sr-only">
        {state === 'copied' ? copiedLabel : ''}
      </p>

      {state === 'error' && (
        <p className="mt-1 text-xs text-red-700">
          コピーできませんでした。表示されている内容を長押しして選択してください。
        </p>
      )}
    </div>
  );
}
