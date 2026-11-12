/**
 * [관리자 > 신고 관리] 회원 정지 모달
 * 정지 일수는 입력칸에 직접 적는다(1일 이상 정수, 상한 없음). 정지 중이면 지금부터 새 일수로 바뀐다.
 * 정지하면 동그리 전체를 이용할 수 없고 기존 로그인도 즉시 끊긴다.
 */
import { useState } from 'react';

import AdminMemberCell from '@/components/admin/report/adminMemberCell';
import Button from '@/components/common/inputs/button';
import { INPUT_CLASS } from '@/constants/inputStyles';
import type { TAdminMember } from '@/types/admin/TAdminReport';
import { parseSuspensionDays } from '@/utils/admin/report';

interface ISuspensionDialogProps {
  member: TAdminMember;
  title: string;
  isSubmitting: boolean;
  onSubmit: (days: number, note: string | null) => void;
  onClose: () => void;
}

export default function SuspensionDialog({ member, title, isSubmitting, onSubmit, onClose }: ISuspensionDialogProps) {
  const [days, setDays] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const parsed = parseSuspensionDays(days);
    if (parsed === null) {
      setError('정지 일수를 1 이상의 숫자로 입력해주세요.');
      return;
    }
    onSubmit(parsed, note.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay px-6">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-suspension-title"
        noValidate
        className="flex w-full max-w-xl flex-col gap-6 rounded-2xl bg-white p-10 text-coolgray-90 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2">
          <h2 id="admin-suspension-title" className="text-heading-4">
            {title}
          </h2>
          <AdminMemberCell member={member} />
          <p className="text-body-s text-coolgray-60">
            정지하면 동그리 전체를 이용할 수 없고 기존 로그인도 바로 끊겨요. 정지 중이면 지금부터 새 일수로 바뀌어요.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-button-m">
          정지 일수
          <span className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              aria-label="정지 일수"
              value={days}
              onChange={(event) => {
                setDays(event.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="예) 30"
              className={`${INPUT_CLASS} w-40 ${error ? 'border-alert' : 'border-coolgray-30'}`}
            />
            <span className="text-body-m">일</span>
          </span>
          {error && <span className="text-body-xs text-alert">{error}</span>}
        </label>
        <label className="flex flex-col gap-2 text-button-m">
          메모 <span className="text-body-xs text-coolgray-60">선택 · 최대 200자</span>
          <textarea
            rows={3}
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={`${INPUT_CLASS} resize-none border-coolgray-30`}
          />
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="outlined" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant={isSubmitting ? 'disabled' : 'alert'} className="flex-1">
            {isSubmitting ? '정지 중' : '정지하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
