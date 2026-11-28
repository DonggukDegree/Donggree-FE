import { describe, expect, it } from 'vitest';

import { getCropOutputSize, toCroppedFileName } from '@/utils/club/clubImageCrop';

describe('getCropOutputSize', () => {
  it('큰 사진은 1440×1080으로 줄인다', () => {
    expect(getCropOutputSize({ width: 4032 })).toEqual({ width: 1440, height: 1080 });
  });

  it('작은 사진은 키우지 않고 4:3 높이를 맞춘다', () => {
    expect(getCropOutputSize({ width: 800.4 })).toEqual({ width: 800, height: 600 });
  });
});

describe('toCroppedFileName', () => {
  it('결과 형식에 맞게 확장자를 바꾼다', () => {
    expect(toCroppedFileName('동아리 사진.heic.png', 'image/webp')).toBe('동아리 사진.heic.webp');
    expect(toCroppedFileName('photo.jpeg', 'image/jpeg')).toBe('photo.jpg');
    expect(toCroppedFileName('.png', 'image/webp')).toBe('club.webp');
  });
});
