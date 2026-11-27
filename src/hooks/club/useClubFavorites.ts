/**
 * [동아리] 찜
 * 서버에 저장한 찜한 동아리 ID를 카드·상세 하트와 찜 모아보기가 함께 쓴다.
 * 하트는 누르자마자 바뀌고(낙관적 갱신), 실패하면 되돌린 뒤 공용 오류 토스트를 띄운다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteClubFavorite, getFavoriteClubIds, putClubFavorite } from '@/apis/club/club';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation, useCoreQuery } from '@/hooks/customQuery';

export function useFavoriteClubIds() {
  const { data } = useCoreQuery(QUERY_KEYS.GET_CLUB_FAVORITES, getFavoriteClubIds);
  return data ?? [];
}

export function useToggleClubFavorite() {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.GET_CLUB_FAVORITES;
  const mutation = useCoreMutation(
    ({ clubId, favorite }: { clubId: number; favorite: boolean }) =>
      favorite ? putClubFavorite(clubId) : deleteClubFavorite(clubId),
    {
      onMutate: async ({ clubId, favorite }) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<number[]>(key);
        queryClient.setQueryData<number[]>(key, (ids = []) =>
          favorite ? [clubId, ...ids.filter((id) => id !== clubId)] : ids.filter((id) => id !== clubId),
        );
        return { previous };
      },
      onError: (error, _variables, context) => {
        const previous = (context as { previous?: number[] } | undefined)?.previous;
        if (previous) queryClient.setQueryData(key, previous);
        toast.error(error.response?.data?.message ?? '찜을 저장하지 못했어요. 다시 시도해주세요.');
      },
      onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
    },
  );
  return (clubId: number, favorite: boolean) => mutation.mutate({ clubId, favorite });
}
