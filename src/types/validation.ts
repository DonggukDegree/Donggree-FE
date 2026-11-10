/** 폼 변환의 성공값 또는 사용자 안내 오류. null 오류는 기존 무안내 거절을 보존한다. */
export type TValidationResult<T> = { ok: true; value: T } | { ok: false; error: string | null };
