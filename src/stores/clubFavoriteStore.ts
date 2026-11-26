/**
 * [동아리] 찜 목록
 * 목록 카드·상세 사진의 하트로 찜하고, 오른쪽 아래 하트 버튼으로 찜한 동아리만 모아본다.
 * 서버 API가 생기기 전까지는 이 브라우저에만 동아리 ID를 저장한다(개인정보 없음). 저장소가 막혀 있으면 이번 방문 동안만 유지한다.
 */
import { create } from 'zustand';

const STORAGE_KEY = 'donggree.clubs.favorites';

const load = (): number[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is number => Number.isSafeInteger(id) && id > 0) : [];
  } catch {
    return [];
  }
};

const save = (ids: number[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 저장소를 쓸 수 없으면 메모리 값만 유지한다.
  }
};

interface IClubFavoriteState {
  ids: number[];
  toggle: (clubId: number) => void;
}

export const useClubFavoriteStore = create<IClubFavoriteState>((set) => ({
  ids: load(),
  toggle: (clubId) =>
    set((state) => {
      const ids = state.ids.includes(clubId) ? state.ids.filter((id) => id !== clubId) : [...state.ids, clubId];
      save(ids);
      return { ids };
    }),
}));
