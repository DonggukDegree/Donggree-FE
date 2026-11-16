import { describe, expect, it } from 'vitest';

import { formatPointAmount, formatPointDate, formatPoints } from '@/utils/point/point';

describe('포인트 표시', () => {
  it('천 단위 쉼표와 P, 적립액은 + 부호', () => {
    expect(formatPoints(0)).toBe('0P');
    expect(formatPoints(12500)).toBe('12,500P');
    expect(formatPointAmount(500)).toBe('+500P');
  });

  it('적립 시각은 연.월.일', () => {
    expect(formatPointDate('2026-11-16T09:30:00')).toBe('2026.11.16');
    expect(formatPointDate('')).toBe('');
  });
});
