/**
 * [포인트] 적립 기준 ? 툴팁
 * ? 버튼에 커서를 올리거나(데스크톱) 눌러 포커스하면(모바일) 활동별 적립액 요약을 보여 준다.
 * 말풍선은 제목 줄(가장 가까운 relative 조상) 전체 폭 기준으로 펼쳐 좁은 화면에서도 잘리지 않는다.
 */
import { POINT_RULE_NOTE, POINT_RULES } from '@/constants/point';
import { formatPointAmount } from '@/utils/point/point';

export default function PointRuleTooltip() {
  return (
    <span className="group">
      <button
        type="button"
        aria-label="포인트 적립 기준"
        aria-describedby="point-rule-tooltip"
        className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-coolgray-30 text-body-xs font-semibold text-coolgray-60 hover:border-primary-60 hover:text-primary-60 focus-visible:border-primary-60 focus-visible:text-primary-60"
      >
        ?
      </button>
      <span
        id="point-rule-tooltip"
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-10 mt-2 w-full max-w-80 translate-y-1 rounded-lg bg-coolgray-90 px-4 py-3 text-left text-body-xs text-white opacity-0 shadow-md transition duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <span className="mb-2 block font-semibold">이렇게 적립돼요</span>
        <span className="flex flex-col gap-1">
          {POINT_RULES.map((rule) => (
            <span key={rule.label} className="flex justify-between gap-3">
              <span className="break-keep">
                {rule.label}
                {rule.note && <span className="text-coolgray-30"> ({rule.note})</span>}
              </span>
              <span className="shrink-0 font-semibold">{formatPointAmount(rule.amount)}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block break-keep text-coolgray-30">{POINT_RULE_NOTE}</span>
      </span>
    </span>
  );
}
