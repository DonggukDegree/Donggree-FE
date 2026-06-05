import { useEffect, useRef, useState } from 'react';

import User from '@/assets/icons/user.svg?react';
import Warning from '@/assets/icons/warning.svg?react';
import ProfileImage from '@/assets/profileImage.svg?react';
import Chip from '@/components/chip';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import TextField from '@/components/common/textField';
import useInView from '@/hooks/useInView';
import useDeleteAccount from '@/hooks/user/useDeleteAccount';
import useUpdateProfile from '@/hooks/user/useUpdateProfile';
import useUserInfo from '@/hooks/user/useUserInfo';
import NotFound from '@/pages/notFound';
import { useModalStore } from '@/stores/modalStore';
import { validateName, validateNickname, validateStudentId } from '@/utils/validators';

export default function Profile() {
  const [ref, isInView] = useInView();
  const { openAlert } = useModalStore();
  const { data, isPending, isError } = useUserInfo();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: deleteAccount } = useDeleteAccount();

  // 본인 인증 완료 시 이름·학번은 잠금(수정 불가).
  const identityVerified = data?.identityVerified ?? false;

  // 폼 입력값 (조회 데이터로 초기화). 캐시가 비어 늦게 도착하는 경우를 대비해 seededRef로 한 번 더 채운다.
  const [name, setName] = useState(data?.name ?? '');
  const [nickname, setNickname] = useState(data?.nickname ?? '');
  const [studentId, setStudentId] = useState(data?.studentId ?? '');
  const seededRef = useRef(false);

  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  const [touched, setTouched] = useState({ name: false, nickname: false, studentId: false });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 정보가 처음 도착하면 폼을 채운다. (이미 채웠으면 사용자의 편집을 덮어쓰지 않음)
  useEffect(() => {
    if (!data || seededRef.current) return;
    seededRef.current = true;
    setName(data.name ?? '');
    setNickname(data.nickname ?? '');
    setStudentId(data.studentId ?? '');
  }, [data]);

  // 프로필 이미지 미리보기 URL 정리 (메모리 누수 방지). 이미지 업로드는 별도 API가 없어 로컬 미리보기만 지원한다.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 입력 변경: 이미 검증이 시작된 필드는 실시간으로 에러를 갱신한다.
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

  // 포커스가 빠지면 검증을 시작하고 에러를 표시한다. (stale 값 방지 위해 이벤트 값 직접 사용)
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

    updateProfile(
      { studentId: trimmedStudentId, name: trimmedName, nickname: trimmedNickname },
      {
        // 수정 성공 후 무효화로 다시 받아온 서버 데이터가 폼에 반영되도록 시드 플래그를 초기화한다.
        // (서버 정규화·다중 기기 등으로 값이 달라진 경우 폼을 최신 상태로 동기화)
        onSuccess: () => {
          seededRef.current = false;
        },
      },
    );
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
    e.target.value = '';
  };

  const handleImageDelete = () => {
    setPreviewUrl(null);
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

      <div className="flex w-full items-center justify-center gap-15">
        <div className="flex flex-1 justify-end p-4">
          <div className="flex flex-col items-center gap-6">
            {previewUrl ? (
              <img src={previewUrl} alt="프로필 이미지" className="h-30 w-30 rounded-full object-cover" />
            ) : (
              <ProfileImage className="h-30 w-30" />
            )}
            <div className="flex flex-col items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button variant="outlined" className="w-30" onClick={() => fileInputRef.current?.click()}>
                이미지 업로드
              </Button>
              {previewUrl && (
                <button
                  type="button"
                  className="text-body-s text-primary-60 underline cursor-pointer"
                  onClick={handleImageDelete}
                >
                  삭제
                </button>
              )}
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
              onChange={(e) => handleStudentIdChange(e.target.value)}
              onBlur={(e) => handleStudentIdBlur(e.target.value)}
              error={studentIdError}
            />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-body-m text-coolgray-90">이름</p>
            <TextField
              placeholder="이름을 입력해주세요"
              value={name}
              disabled={identityVerified}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={(e) => handleNameBlur(e.target.value)}
              error={nameError}
            />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-body-m text-coolgray-90">닉네임</p>
            <TextField
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              onBlur={(e) => handleNicknameBlur(e.target.value)}
              error={nicknameError}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="w-40" onClick={handleSubmit} disabled={isUpdating}>
          수정하기
        </Button>
        <Button variant="alert" className="w-40" onClick={handleOpenModal}>
          탈퇴하기
        </Button>
      </div>
    </div>
  );
}
