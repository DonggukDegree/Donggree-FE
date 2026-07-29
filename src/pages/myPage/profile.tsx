/**
 * [마이페이지 > 프로필 관리] 페이지 (/my-page/profile)
 * 학번·이름·닉네임을 수정하고 회원 탈퇴를 진행하는 화면.
 * 본인 인증(성적표 PDF의 학번·이름 일치)이 끝난 회원은 학번과 이름이 잠겨 닉네임만 바꿀 수 있다.
 *
 * 폼 상태 메모:
 * 조회가 끝난 뒤에만 ProfileUserForm을 마운트하므로 서버 값을 useState 초기값으로 바로 쓸 수 있고,
 * effect로 폼을 다시 채울 필요가 없다. 저장 후 서버 값이 실제로 바뀌면 key가 달라져 폼이 새로 채워진다.
 */
import { useState } from 'react';
import { toast } from 'sonner';

import User from '@/assets/icons/user.svg?react';
import Warning from '@/assets/icons/warning.svg?react';
import ProfileImage from '@/assets/profileImage.svg?react';
import Button from '@/components/common/button';
import Chip from '@/components/common/chip';
import Loading from '@/components/common/loading';
import TextField from '@/components/common/textField';
import { READY_MESSAGE } from '@/constants/links';
import useInView from '@/hooks/useInView';
import useDeleteAccount from '@/hooks/user/useDeleteAccount';
import useUpdateProfile from '@/hooks/user/useUpdateProfile';
import useUserInfo from '@/hooks/user/useUserInfo';
import NotFound from '@/pages/exception/notFound';
import { useModalStore } from '@/stores/modalStore';
import type { TUserInfo } from '@/types/user/TGetUserInfo';
import { validateName, validateNickname, validateStudentId } from '@/utils/validators';

export default function Profile() {
  const [ref, isInView] = useInView();
  const { openAlert } = useModalStore();
  const { data, isPending, isError } = useUserInfo();
  const { mutate: deleteAccount } = useDeleteAccount();

  const handleOpenModal = () => {
    openAlert({
      icon: Warning,
      title: '정말 탈퇴하시겠습니까?',
      subtitle: '회원 탈퇴 시 모든 정보가 폐기되어 되돌릴 수 없습니다.',
      description: '회원 탈퇴는 신중하게 해주세요.\n다른 문제가 있다면 고객지원에 문의해주세요.',
      buttonText: '탈퇴하기',
      buttonVariant: 'alert',
      onConfirm: () => deleteAccount(),
    });
  };

  // 사용자 정보 조회 상태 처리
  if (isPending) {
    return <Loading />;
  }
  if (isError || !data) {
    return <NotFound />;
  }

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-12 p-20 ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-12">
        <User className="w-20 h-20" />
        <p className="text-heading-2 text-coolgray-90">프로필 관리</p>
      </div>

      {/*
        key에 서버 값을 담아, 저장 후 재조회로 값이 실제로 달라졌을 때만 폼을 새로 마운트한다.
        (값이 그대로면 리마운트가 없으므로 입력 중 백그라운드 재조회에 폼이 초기화되지 않는다)
      */}
      <ProfileUserForm
        key={`${data.studentId}|${data.name}|${data.nickname}`}
        user={data}
        onDeleteAccount={handleOpenModal}
      />
    </div>
  );
}

interface IProfileUserFormProps {
  user: TUserInfo;
  onDeleteAccount: () => void;
}

/**
 * 프로필 본문 (프로필 이미지 + 학번·이름·닉네임 입력 + 하단 버튼)
 * 마운트 시점에 이미 서버 값이 있으므로 그것을 useState 초기값으로 쓴다.
 * 검증은 blur를 겪은 칸부터 실시간으로 보여 주고, 제출 시 한 번 더 전체를 검사한다.
 */
function ProfileUserForm({ user, onDeleteAccount }: IProfileUserFormProps) {
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [name, setName] = useState(user.name ?? '');
  const [nickname, setNickname] = useState(user.nickname ?? '');
  const [studentId, setStudentId] = useState(user.studentId ?? '');

  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  // 한 번도 건드리지 않은 칸에까지 에러를 띄우지 않기 위해, blur를 겪은 칸만 실시간 검증한다.
  const [touched, setTouched] = useState({ name: false, nickname: false, studentId: false });

  // 본인 인증 완료 시 이름·학번은 잠금(수정 불가).
  const identityVerified = user.identityVerified ?? false;

  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) setNameError(validateName(value));
  };
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (touched.nickname) setNicknameError(validateNickname(value));
  };
  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    if (touched.studentId) setStudentIdError(validateStudentId(value));
  };

  // 포커스가 빠지면 검증을 시작한다. (state가 아직 갱신 전일 수 있어 이벤트 값을 직접 쓴다)
  const handleNameBlur = (value: string) => {
    setTouched((prev) => ({ ...prev, name: true }));
    setNameError(validateName(value));
  };
  const handleNicknameBlur = (value: string) => {
    setTouched((prev) => ({ ...prev, nickname: true }));
    setNicknameError(validateNickname(value));
  };
  const handleStudentIdBlur = (value: string) => {
    setTouched((prev) => ({ ...prev, studentId: true }));
    setStudentIdError(validateStudentId(value));
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedNickname = nickname.trim();
    const trimmedStudentId = studentId.trim();

    // 본인 인증 시 이름·학번은 잠겨 서버 값 그대로 전송되므로 닉네임만 검증한다.
    const nextNameError = identityVerified ? '' : validateName(trimmedName);
    const nextStudentIdError = identityVerified ? '' : validateStudentId(trimmedStudentId);
    const nextNicknameError = validateNickname(trimmedNickname);
    setNameError(nextNameError);
    setStudentIdError(nextStudentIdError);
    setNicknameError(nextNicknameError);
    setTouched({ name: true, nickname: true, studentId: true });
    if (nextNameError || nextStudentIdError || nextNicknameError) return;

    updateProfile({ studentId: trimmedStudentId, name: trimmedName, nickname: trimmedNickname });
  };

  return (
    <>
      <div className="flex w-full items-center justify-center gap-15">
        <div className="flex flex-1 justify-end p-4">
          <div className="flex flex-col items-center gap-6">
            <ProfileImage className="h-30 w-30" />
            <div className="flex flex-col items-center gap-2">
              {/* 프로필 사진 변경: 업로드 API 미구현이라 준비 중 안내만 한다. */}
              <Button variant="outlined" className="w-30" onClick={() => toast(READY_MESSAGE)}>
                이미지 업로드
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start gap-6 p-4">
          {/* 본인 인증 상태 칩 (맨 위, 왼쪽 정렬) */}
          <Chip
            variant={identityVerified ? 'satisfied' : 'unsatisfied'}
            label={identityVerified ? '본인 인증 완료' : '본인 인증 미완료'}
          />

          <div className="flex flex-col items-start gap-1">
            <p className="text-body-m text-coolgray-90">학번</p>
            <TextField
              placeholder="학번을 입력해주세요"
              value={studentId}
              inputMode="numeric"
              disabled={identityVerified}
              onChange={(event) => handleStudentIdChange(event.target.value)}
              onBlur={(event) => handleStudentIdBlur(event.target.value)}
              error={studentIdError}
            />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-body-m text-coolgray-90">이름</p>
            <TextField
              placeholder="이름을 입력해주세요"
              value={name}
              disabled={identityVerified}
              onChange={(event) => handleNameChange(event.target.value)}
              onBlur={(event) => handleNameBlur(event.target.value)}
              error={nameError}
            />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-body-m text-coolgray-90">닉네임</p>
            <TextField
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChange={(event) => handleNicknameChange(event.target.value)}
              onBlur={(event) => handleNicknameBlur(event.target.value)}
              error={nicknameError}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 행: 수정하기 / 탈퇴하기 (탈퇴 확인 모달은 페이지가 연다) */}
      <div className="flex items-center gap-4">
        <Button className="w-40" onClick={handleSubmit} disabled={isUpdating}>
          수정하기
        </Button>
        <Button variant="alert" className="w-40" onClick={onDeleteAccount}>
          탈퇴하기
        </Button>
      </div>
    </>
  );
}
