/**
 * [관리자 > 신고 관리] 회원 행
 * 이름·닉네임·학번·단과대·학과를 한 줄로 보여주고, 정지 중이면 종료 시각 배지를 붙인다. 탈퇴했으면 "탈퇴한 회원".
 * onSelect를 주면 눌러서 회원 상세로 넘어갈 수 있다.
 */
import type { TAdminMember } from '@/types/admin/TAdminReport';
import { formatAdminDateTime, formatAdminMember, isSuspendedNow } from '@/utils/admin/report';

interface IAdminMemberCellProps {
  label?: string;
  member: TAdminMember | null;
  onSelect?: (memberId: number) => void;
}

export default function AdminMemberCell({ label, member, onSelect }: IAdminMemberCellProps) {
  const text = formatAdminMember(member);
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-body-s text-coolgray-90">
      {label && <span className="text-coolgray-60">{label}</span>}
      {member && onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(member.memberId)}
          className="cursor-pointer text-left underline decoration-coolgray-30 underline-offset-2 hover:text-primary-90"
        >
          {text}
        </button>
      ) : (
        <span className={member ? '' : 'text-coolgray-60'}>{text}</span>
      )}
      {isSuspendedNow(member) && (
        <span className="rounded-full bg-alert/10 px-2 py-0.5 text-body-xs text-alert">
          정지 ~{formatAdminDateTime(member?.suspendedUntil ?? null)}
        </span>
      )}
    </span>
  );
}
