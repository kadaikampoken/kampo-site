/**
 * components/ui/form-field.tsx
 * ラベル・入力・エラー表示をまとめたフォーム部品（項目17：バリデーション表示）
 */
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const controlBase =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kampo-500 focus:border-kampo-500 disabled:bg-gray-100';

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-kampo-900">
      {children}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-red-700">
      {messages[0]}
    </p>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-gray-500">{children}</p>;
}

export function Input({
  className,
  error,
  ...props
}: ComponentProps<'input'> & { error?: boolean }) {
  return (
    <input
      className={cn(controlBase, error ? 'border-red-500' : 'border-sand-300', className)}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

export function Textarea({
  className,
  error,
  ...props
}: ComponentProps<'textarea'> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        'min-h-[8rem] leading-relaxed',
        error ? 'border-red-500' : 'border-sand-300',
        className
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  error,
  children,
  ...props
}: ComponentProps<'select'> & { error?: boolean }) {
  return (
    <select
      className={cn(controlBase, error ? 'border-red-500' : 'border-sand-300', className)}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-sand-400 text-kampo-700 focus:ring-kampo-500',
        className
      )}
      {...props}
    />
  );
}

/** フィールド1つ分のラッパー */
export function Field({
  label,
  htmlFor,
  required,
  errors,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  errors?: string[];
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && <Hint>{hint}</Hint>}
      <FieldError messages={errors} />
    </div>
  );
}
