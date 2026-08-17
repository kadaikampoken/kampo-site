'use client';

/**
 * components/admin/delete-button.tsx
 * 確認ダイアログ付きの削除ボタン
 */
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

function Inner({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'text-sm font-medium text-red-700 underline-offset-2 hover:underline disabled:opacity-50',
        className
      )}
    >
      {pending ? '削除中…' : label}
    </button>
  );
}

export function DeleteButton({
  action,
  hiddenFields,
  label = '削除',
  confirmMessage = 'この操作は取り消せません。本当に削除しますか？',
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className="inline"
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Inner label={label} className={className} />
    </form>
  );
}
