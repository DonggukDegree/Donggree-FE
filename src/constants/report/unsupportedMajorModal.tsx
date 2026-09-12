import type { ReactNode } from 'react';

// 복수전공·부전공 이력이 있을 때 졸업 판정 화면에서 안내할 모달 문구.
type TUnsupportedMajorModalContent = {
  title: string;
  subtitle: ReactNode;
  description: string;
};

export const UNSUPPORTED_MAJOR_MODAL: TUnsupportedMajorModalContent = {
  title: '동그리가 정확한 분석에 실패했어요',
  subtitle: (
    <>
      <span className="text-primary-60">복수전공·부전공</span>은 아직 졸업 판정을 지원하지 않아요.
    </>
  ),
  description:
    '지금 제공하는 리포트는 정확하지 않을 수 있어요.\n빠른 지원을 원한다면 고객지원에 문의해주세요.',
};
