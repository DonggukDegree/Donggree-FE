import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import User from '@/assets/icons/user.svg?react';
import ProfileImage from '@/assets/profileImage.svg?react';
import Button from '@/components/common/button';
import TextField from '@/components/common/textField';
import useInView from '@/hooks/useInView';

const PROFILE_FIELDS = [
  { label: '이름', placeholder: '이름을 입력해주세요' },
  { label: '닉네임', placeholder: '닉네임을 입력해주세요' },
  { label: '학번', placeholder: '학번을 입력해주세요' },
] as const;

export default function Profile() {
  const navigate = useNavigate();
  const [ref, isInView] = useInView();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selected));
    }
    e.target.value = '';
  };

  const handleImageDelete = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

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
          {PROFILE_FIELDS.map(({ label, placeholder }) => (
            <div key={label} className="flex flex-col items-start gap-1">
              <p className="text-body-m text-coolgray-90">{label}</p>
              <TextField placeholder={placeholder} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="w-40" onClick={() => navigate('/')}>
          수정하기
        </Button>
        <Button variant="alert" className="w-40" onClick={() => navigate('/')}>
          탈퇴하기
        </Button>
      </div>
    </div>
  );
}
