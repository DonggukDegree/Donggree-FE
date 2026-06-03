import { useState } from 'react';

import Button from '@/components/common/button';
import TextField from '@/components/common/textField';
import useOnboarding from '@/hooks/auth/useOnboarding';
import { useModalStore } from '@/stores/modalStore';

// 클라이언트 입력 검증 (서버 규칙과 동일하게 맞춘다)
// 이름: 필수, 5자 이하 / 학번: 필수, 숫자 10자리
const validateName = (value: string): string => {
  if (!value.trim()) return '*이름을 입력해주세요.';
  if (value.length > 5) return '*이름은 5자 이하로 입력해주세요.';
  return '';
};

const validateStudentId = (value: string): string => {
  if (!value) return '*학번을 입력해주세요.';
  if (!/^\d{10}$/.test(value)) return '*학번은 숫자 10자리로 입력해주세요.';
  return '';
};

export default function OnBoardingModal() {
  const { type, closeModal } = useModalStore();
  const { mutate: submitOnboarding, isPending } = useOnboarding();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  // 필드별 에러 메시지와, 한 번이라도 포커스가 빠진(=검증을 시작할) 필드 여부
  const [nameError, setNameError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  const [touched, setTouched] = useState({ name: false, studentId: false });
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  if (type !== 'onboarding') return null;

  // 이름 입력 변경: 이미 검증이 시작된 필드면 입력하는 즉시 에러를 다시 계산해 갱신한다.
  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) setNameError(validateName(value));
  };

  // 학번 입력 변경: 동일하게 검증이 시작된 경우에만 실시간 재검증한다.
  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    if (touched.studentId) setStudentIdError(validateStudentId(value));
  };

  // 포커스가 빠지는 순간 검증을 시작(touched=true)하고 에러를 표시한다.
  // 상태(name/studentId) 대신 이벤트의 최신 값을 직접 받아 stale 값으로 검증되는 것을 방지한다.
  const handleNameBlur = (value: string) => {
    setTouched((prev) => ({ ...prev, name: true }));
    setNameError(validateName(value));
  };

  const handleStudentIdBlur = (value: string) => {
    setTouched((prev) => ({ ...prev, studentId: true }));
    setStudentIdError(validateStudentId(value));
  };

  // 온보딩 정보 저장. 성공 시 홈 이동은 useOnboarding이 처리하고, 여기서는 모달만 닫는다.
  const handleSubmit = () => {
    // 앞뒤 공백이 그대로 서버에 저장되지 않도록 trim 후 검증·전송한다.
    const trimmedName = name.trim();
    const trimmedStudentId = studentId.trim();

    // 제출 시점에 두 필드를 모두 검증하고, 하나라도 어긋나면 전송하지 않는다.
    const nextNameError = validateName(trimmedName);
    const nextStudentIdError = validateStudentId(trimmedStudentId);
    setNameError(nextNameError);
    setStudentIdError(nextStudentIdError);
    setTouched({ name: true, studentId: true });
    if (nextNameError || nextStudentIdError) return;

    submitOnboarding({ studentId: trimmedStudentId, name: trimmedName }, { onSuccess: () => closeModal() });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay">
      <div className="rounded-2xl bg-white py-10 px-60 flex flex-col items-center gap-5 text-coolgray-90">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-heading-2">동그리가 처음이신가요?</h2>
          <p className="text-body-l">서비스 이용에 필요한 기본 정보를 입력해주세요.</p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-body-m">이름</span>
            <TextField
              placeholder="김동국"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={(e) => handleNameBlur(e.target.value)}
              error={nameError}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-body-m">학번</span>
            <TextField
              placeholder="2023123456"
              value={studentId}
              inputMode="numeric"
              onChange={(e) => handleStudentIdChange(e.target.value)}
              onBlur={(e) => handleStudentIdBlur(e.target.value)}
              error={studentIdError}
            />
          </label>
        </div>

        <div className="flex flex-col gap-1 w-full px-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedAge}
              onChange={(e) => setAgreedAge(e.target.checked)}
              className="w-4 h-4 accent-primary-60"
            />
            <span className="text-body-m">[필수] 만 14세 이상</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="w-4 h-4 accent-primary-60"
            />
            <span className="text-body-m">
              [필수] 개인정보 수집·이용 동의 (
              <a href="#" target="_blank" rel="noopener noreferrer" className="underline">
                자세히
              </a>
              )
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 accent-primary-60"
            />
            <span className="text-body-m">
              [필수] 서비스 이용약관 동의 (
              <a href="#" target="_blank" rel="noopener noreferrer" className="underline">
                자세히
              </a>
              )
            </span>
          </label>
        </div>
        <Button
          className="w-full text-body-l py-3"
          onClick={handleSubmit}
          disabled={!name || !studentId || !agreedAge || !agreedPrivacy || !agreedTerms || isPending}
        >
          동그리 시작하기
        </Button>
      </div>
    </div>
  );
}
