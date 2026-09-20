import type { TRequirementTrack } from '@/types/admin/TRequirementSets';

// 과정별 화면 문구
export const REQUIREMENT_TRACK_LABEL: Record<TRequirementTrack, string> = {
  ALL: '과정 구분 없음',
  GENERAL: '일반과정',
  ADVANCED: '심화과정',
};

// 관리자 폼에서 과정을 고를 때 보여 줄 설명
export const REQUIREMENT_TRACK_DESCRIPTION: Record<TRequirementTrack, string> = {
  ALL: '일반·심화 구분이 없는 학과.',
  GENERAL: '공학인증심화대상이 아닌 학생에게만 적용',
  ADVANCED: '공학인증심화대상 학생에게만 적용',
};

// 관리자 폼의 과정 선택지. 기본값은 ALL이라 맨 앞에 둔다.
export const REQUIREMENT_TRACKS: TRequirementTrack[] = ['ALL', 'GENERAL', 'ADVANCED'];
