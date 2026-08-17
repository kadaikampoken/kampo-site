'use client';

/**
 * components/admin/role-form.tsx
 * ユーザーの権限変更フォーム
 */
import { useActionState } from 'react';
import type { Role } from '@prisma/client';

import { updateUserRoleAction } from '@/app/actions/users';
import { initialActionState } from '@/lib/validations';
import { ROLE_LABEL } from '@/lib/constants';
import { SubmitButton } from '@/components/ui/submit-button';

export function RoleForm({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: Role;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(updateUserRoleAction, initialActionState);

  if (disabled) {
    return <span className="text-xs text-gray-500">（自分自身のため変更不可）</span>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-md border border-sand-300 bg-white px-2 py-1.5 text-sm focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
        aria-label="権限"
      >
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      <SubmitButton size="sm" variant="outline" pendingLabel="変更中…">
        変更
      </SubmitButton>
      {state.message && (
        <span className={state.ok ? 'text-xs text-kampo-700' : 'text-xs text-red-700'}>
          {state.message}
        </span>
      )}
    </form>
  );
}
