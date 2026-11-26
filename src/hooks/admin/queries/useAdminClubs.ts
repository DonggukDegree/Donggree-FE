/**
 * [관리자 > 동아리 관리] 조회 훅: 요청 목록(상태별), 동아리 목록(이름 검색), 배너 목록
 */
import { getAdminClubBanners, getAdminClubRequests, getAdminClubs } from '@/apis/club/clubAdmin';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TClubRequestStatus } from '@/types/club/TClub';

export const useAdminClubRequests = (status: TClubRequestStatus | null) =>
  useCoreQuery(QUERY_KEYS.ADMIN_CLUB_REQUESTS(status), () => getAdminClubRequests(status));

export const useAdminClubs = (keyword: string) =>
  useCoreQuery(QUERY_KEYS.ADMIN_CLUBS(keyword), () => getAdminClubs(keyword));

export const useAdminClubBanners = () => useCoreQuery(QUERY_KEYS.ADMIN_CLUB_BANNERS, getAdminClubBanners);
