/**
 * components/common/empty-state.tsx  （項目22：Empty State）
 */
import type { ReactNode } from 'react';
import { LinkButton } from '@/components/ui/button';

export function EmptyState({
  title = 'データがありません',
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
      <div className="mb-4 text-kampo-400" aria-hidden="true">
        {icon ?? (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <p className="text-base font-semibold text-kampo-900">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-gray-600">{description}</p>}
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} variant="outline" className="mt-6">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}
