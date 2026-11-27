/**
 * [동아리] 사진 주소
 * BE는 사진을 API 서버 기준 경로(/api/clubs/images/...)로 준다. 화면에서 그릴 때만 API 서버 주소를 붙이고,
 * 저장할 때는 받은 경로 그대로 돌려보낸다(배너 이미지 등). 미리보기(blob:)·외부 주소는 그대로 쓴다.
 */
export const toAssetUrl = (url: string): string =>
  url.startsWith('/api/') ? `${import.meta.env.VITE_API_URL ?? ''}${url}` : url;
