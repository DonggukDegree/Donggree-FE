import type { TFaqTag } from '@/types/support/TFaq';

// 태그별 화면 문구
export const FAQ_TAG_LABEL: Record<TFaqTag, string> = {
  SERVICE: '서비스',
  COMMON: '공통',
  MAJOR: '전공',
};

// 관리자 화면에서 태그를 고를 때 보여 줄 설명
export const FAQ_TAG_DESCRIPTION: Record<TFaqTag, string> = {
  SERVICE: '동그리 서비스 자체 (가입·업로드·학업정보수정 등)',
  COMMON: '공통 졸업 요건 (교양·학문기초 등)',
  MAJOR: '전공 졸업 요건',
};

// 상단 칩의 노출 순서.
export const FAQ_TAG_FILTERS: { value: TFaqTag | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'SERVICE', label: FAQ_TAG_LABEL.SERVICE },
  { value: 'COMMON', label: FAQ_TAG_LABEL.COMMON },
  { value: 'MAJOR', label: FAQ_TAG_LABEL.MAJOR },
];

// 관리자 폼의 태그 선택지
export const FAQ_TAGS: TFaqTag[] = ['SERVICE', 'COMMON', 'MAJOR'];
