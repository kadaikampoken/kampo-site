'use client';

/**
 * components/attendance-form.tsx  （項目31：イベント参加・不参加機能）
 */
import { useActionState, useState } from 'react';
import type { AttendanceStatus } from '@prisma/client';

import { setAttendanceAction, cancelAttendanceAction } from '@/app/actions/events';
import { initialActionState } from '@/lib/validations';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert } from '@/components/ui/alert';
import { FieldError, Label, Textarea } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';

export function AttendanceForm({
  eventId,
  currentStatus,
  currentNote,
  disabled,
  disabledReason,
}: {
  eventId: string;
  currentStatus: AttendanceStatus | null;
  currentNote: string | null;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [state, formAction] = useActionState(setAttendanceAction, initialActionState);
  const [selected, setSelected] = useState<AttendanceStatus>(currentStatus ?? 'ATTENDING');

  if (disabled) {
    return (
      <Alert tone="info">
        {disabledReason ?? 'このイベントは参加登録を受け付けていません。'}
        {currentStatus && (
          <span className="mt-1 block font-medium">
            あなたの登録状況：{currentStatus === 'ATTENDING' ? '参加' : '不参加'}
          </span>
        )}
      </Alert>
    );
  }

  return (
    <div className="rounded-lg border border-kampo-200 bg-kampo-50 p-6">
      <h2 className="text-base font-bold text-kampo-900">参加登録</h2>
      <p className="mt-1 text-sm text-gray-600">
        {currentStatus
          ? '登録内容はいつでも変更できます。'
          : '参加・不参加をお知らせください。'}
      </p>

      {state.message && (
        <Alert tone={state.ok ? 'success' : 'error'} className="mt-4">
          {state.message}
        </Alert>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="eventId" value={eventId} />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-kampo-900">
            参加状況 <span className="text-red-600">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: 'ATTENDING', label: '参加する', emoji: '◯' },
                { value: 'NOT_ATTENDING', label: '不参加', emoji: '×' },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 bg-white px-4 py-3 text-sm font-medium transition-colors',
                  selected === opt.value
                    ? 'border-kampo-600 text-kampo-800'
                    : 'border-sand-200 text-gray-600 hover:border-kampo-300'
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={selected === opt.value}
                  onChange={() => setSelected(opt.value)}
                  className="sr-only"
                />
                <span aria-hidden="true" className="text-lg">
                  {opt.emoji}
                </span>
                {opt.label}
              </label>
            ))}
          </div>
          <FieldError messages={state.errors?.status} />
        </fieldset>

        <div>
          <Label htmlFor="note">連絡事項（任意）</Label>
          <Textarea
            id="note"
            name="note"
            rows={3}
            maxLength={200}
            defaultValue={currentNote ?? ''}
            placeholder="例）30分ほど遅れて参加します／初参加です"
            error={Boolean(state.errors?.note)}
            className="min-h-0"
          />
          <FieldError messages={state.errors?.note} />
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="送信中…">
            {currentStatus ? '登録内容を更新する' : 'この内容で登録する'}
          </SubmitButton>
        </div>
      </form>

      {currentStatus && (
        <form action={cancelAttendanceAction} className="mt-3 border-t border-kampo-200 pt-3">
          <input type="hidden" name="eventId" value={eventId} />
          <button
            type="submit"
            className="text-sm text-gray-600 underline hover:text-red-700"
          >
            登録を取り消す
          </button>
        </form>
      )}
    </div>
  );
}
