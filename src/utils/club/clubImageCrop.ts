/**
 * [동아리] 사진 크롭
 * 고른 사진에서 크롭 화면이 정한 영역(원본 픽셀 기준)을 잘라 가로 4:3 이미지 파일로 만든다.
 * 긴 변은 최대 1440px로 줄이고 작은 사진은 키우지 않는다. WebP로 만들고, 브라우저가 WebP로 못 만들면(일부 Safari) JPG로 만든다.
 */
import type { Area } from 'react-easy-crop';

import { CLUB_LIMITS } from '@/constants/club';

const QUALITY = 0.85;

// 결과 이미지 크기. 잘라낸 영역 폭과 최대 폭 중 작은 쪽을 쓰고, 높이는 4:3에 맞춘다.
export const getCropOutputSize = (area: Pick<Area, 'width'>) => {
  const width = Math.max(1, Math.min(CLUB_LIMITS.IMAGE_OUTPUT_WIDTH_MAX, Math.round(area.width)));
  return { width, height: Math.max(1, Math.round(width / CLUB_LIMITS.IMAGE_ASPECT)) };
};

// 원본 이름의 확장자를 결과 형식에 맞게 바꾼다.
export const toCroppedFileName = (name: string, type: string) => {
  const base = name.replace(/\.[^.]+$/, '') || 'club';
  return `${base}.${type === 'image/webp' ? 'webp' : 'jpg'}`;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('사진을 읽지 못했어요.'));
    image.src = src;
  });

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

export const cropImageToFile = async (src: string, area: Area, name: string): Promise<File> => {
  const image = await loadImage(src);
  const { width, height } = getCropOutputSize(area);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('사진을 자르지 못했어요.');
  // 투명한 PNG를 JPG로 만들 때 검게 나오지 않도록 흰 바탕을 먼저 칠한다.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

  const webp = await toBlob(canvas, 'image/webp');
  const blob = webp?.type === 'image/webp' ? webp : await toBlob(canvas, 'image/jpeg');
  if (!blob) throw new Error('사진을 자르지 못했어요.');
  return new File([blob], toCroppedFileName(name, blob.type), { type: blob.type });
};
