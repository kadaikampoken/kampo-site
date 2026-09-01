'use client';

/**
 * components/admin/donation-status-form.tsx
 * 入金確認状態を変更するセレクト（選択後に「変更」で確定）
 */
import { useFormStatus } from 'react-dom';
import type { DonationStatus } from '@prisma/client';

import { updateDonationStatusAction } from '@/app/actions/donations';
import { DONATION_STATUS_OPTIONS } from '@/lib/constants';

function ApplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-8 shrink-0 rounded-md border border-kampo-300 bg-white px-3 text-xs font-medium text-kampo-800 hover:bg-kampo-50 disabled:opacity-50"
    >
      {pending ? '変更中…' : '変更'}
    </button>
  );
}

export function DonationStatusForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: DonationStatus;
}) {
  return (
    <form action={updateDonationStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={currentStatus}
        aria-label="入金確認状態"
        className="h-8 rounded-md border border-sand-300 bg-white px-2 text-xs focus:border-kampo-500 focus:outline-none focus:ring-2 focus:ring-kampo-500"
      >
        {DONATION_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ApplyButton />
    </form>
  );
}
