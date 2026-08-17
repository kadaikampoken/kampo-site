'use client';

/**
 * components/ui/submit-button.tsx
 * useFormStatus で送信中の状態を表示する送信ボタン
 */
import { useFormStatus } from 'react-dom';
import { Button } from './button';

export function SubmitButton({
  children,
  pendingLabel = '送信中…',
  variant = 'primary',
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
