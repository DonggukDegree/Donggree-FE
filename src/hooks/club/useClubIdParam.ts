import { useSearchParams } from 'react-router-dom';

import { parseClubIdParam } from '@/utils/club/club';

// [동아리] 주소창 ?club=ID. 수정·모집 페이지가 어떤 동아리를 다루는지 읽는다.
export default function useClubIdParam() {
  const [searchParams] = useSearchParams();
  return parseClubIdParam(searchParams.get('club'));
}
