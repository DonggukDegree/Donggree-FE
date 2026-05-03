import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/common/button';
import TextField from '@/components/common/textField';
import { useModalStore } from '@/stores/modalStore';

export default function OnBoardingModal() {
  const { type, closeModal } = useModalStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  if (type !== 'onboarding') return null;

  const handleSubmit = () => {
    // TODO: API 연결
    closeModal();
    navigate('/');
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
            <TextField placeholder="김동국" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-body-m">닉네임</span>
            <TextField placeholder="동그리" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-body-m">학번</span>
            <TextField placeholder="2023123456" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
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
          disabled={!name || !nickname || !studentId || !agreedAge || !agreedPrivacy || !agreedTerms}
        >
          동그리 시작하기
        </Button>
      </div>
    </div>
  );
}
