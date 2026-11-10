/**
 * [관리자 공용] 조회 필터 바 셸
 * 관리자 화면(과목 관리 · 졸업 요건 관리)에서 조회 결과 목록 바로 위에 가로로 길게 놓이는 흰 카드의 껍데기.
 * 제목/설명 → 필터 입력들(children) → 오른쪽 끝 [초기화][필터 적용] 순서를 고정해,
 * 두 화면의 필터가 서로 다른 여백·버튼 모양으로 어긋나지 않게 한다.
 *
 * 필터 값 자체는 각 화면의 컨트롤러 훅이 들고 있고, 이 컴포넌트는 배치와 버튼만 담당한다.
 * 버튼을 누르는 시점에만 조회가 일어나므로(입력 중에는 요청 없음) onApply는 필수다.
 */
import type { ReactNode } from 'react';

interface IAdminFilterBarProps {
  title: string;
  description: string;
  // 필터 입력들. 보통 FilterField 여러 개를 나열한다.
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
}

export default function AdminFilterBar({ title, description, children, onApply, onReset }: IAdminFilterBarProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-coolgray-10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-heading-5 text-coolgray-90">{title}</h2>
        <p className="text-body-s text-coolgray-60">{description}</p>
      </div>

      {/* 입력칸들이 남는 폭을 나눠 갖고(flex-1), 버튼은 항상 오른쪽 끝에 붙는다. */}
      <div className="flex flex-wrap items-end gap-3">
        {children}

        <div className="flex gap-2 pb-0.5">
          <button
            type="button"
            className="cursor-pointer rounded-full px-5 py-2 text-button-s text-coolgray-60 hover:text-primary-60"
            onClick={onReset}
          >
            초기화
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-full bg-primary-60 px-5 py-2 text-button-s text-white hover:opacity-90"
            onClick={onApply}
          >
            필터 적용
          </button>
        </div>
      </div>
    </section>
  );
}

interface IFilterFieldProps {
  label: string;
  // 이 필드가 차지할 최소 폭. 내용 길이에 따라 화면마다 다르게 준다.
  className?: string;
  children: ReactNode;
}

// 필터 입력 한 칸(라벨 + 컨트롤).
// 컨트롤이 button(다중 선택 드롭다운)일 수도 있어 label 대신 div로 감싼다.
// (label로 감싸면 라벨 텍스트 클릭이 버튼 클릭으로 전달돼 드롭다운이 열린다)
export function FilterField({ label, className = '', children }: IFilterFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-body-s font-semibold text-coolgray-90">{label}</span>
      {children}
    </div>
  );
}
