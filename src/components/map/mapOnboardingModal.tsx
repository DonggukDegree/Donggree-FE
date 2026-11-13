/**
 * [동글맵] 첫 방문 튜토리얼 모달
 * 지도 화면에 처음 들어오면 전역 모달로 열린다. 위에 4:3 프리뷰 이미지, 아래에 제목·본문과 진행 점,
 * 맨 아래 양 끝에 이전·다음 버튼을 둔다. 첫 단계에는 이전 버튼이 없고, 마지막 단계의 다음은 "시작하기"가 된다.
 * 배경을 눌러도 닫히지 않으며 "시작하기"를 눌러야만 닫히고 본 것으로 기록된다.
 */
import { useEffect, useState } from 'react';

import Button from '@/components/common/inputs/button';
import { MAP_ONBOARDING_STEPS } from '@/constants/place';
import { useModalStore } from '@/stores/modalStore';
import { trackEvent } from '@/utils/analytics/analytics';
import { markMapOnboardingSeen } from '@/utils/place/mapOnboarding';

export default function MapOnboardingModal() {
  const closeModal = useModalStore((state) => state.closeModal);
  const [stepIndex, setStepIndex] = useState(0);
  const step = MAP_ONBOARDING_STEPS[stepIndex] ?? MAP_ONBOARDING_STEPS[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === MAP_ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    trackEvent('map_onboarding_shown');
  }, []);

  const goNext = () => {
    if (!isLast) {
      setStepIndex((index) => index + 1);
      return;
    }
    trackEvent('map_onboarding_complete');
    markMapOnboardingSeen();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-overlay p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-onboarding-title"
        aria-describedby="map-onboarding-body"
        className="flex max-h-[90dvh] w-full max-w-100 flex-col overflow-y-auto rounded-2xl bg-white"
      >
        {/* 이미지는 가로 4 : 세로 3. 아직 이미지가 없는 단계는 같은 비율의 빈 자리만 둔다.
            가로로 눕힌 휴대폰처럼 낮은 화면에서는 문구·버튼이 함께 보이도록 이미지 높이를 화면의 45%로 제한한다. */}
        {step?.image ? (
          <img src={step.image} alt="" className="aspect-[4/3] max-h-[45dvh] w-full shrink-0 object-cover" />
        ) : (
          <div aria-hidden="true" className="aspect-[4/3] max-h-[45dvh] w-full shrink-0 bg-coolgray-10" />
        )}

        <div className="flex flex-col items-center gap-5 px-6 pt-6 pb-6">
          {/* 단계마다 문구 길이가 달라도 점·버튼 위치가 흔들리지 않도록 최소 높이를 둔다. */}
          <div className="flex min-h-24 flex-col items-center gap-2 text-center">
            <h2 id="map-onboarding-title" className="break-keep text-heading-5 text-coolgray-90">
              {step?.title}
            </h2>
            <p id="map-onboarding-body" className="break-keep text-body-s text-coolgray-60">
              {step?.body}
            </p>
          </div>

          <ol aria-label={`${MAP_ONBOARDING_STEPS.length}단계 중 ${stepIndex + 1}단계`} className="flex gap-2">
            {MAP_ONBOARDING_STEPS.map((item, index) => (
              <li
                key={item.title}
                aria-current={index === stepIndex ? 'step' : undefined}
                className={`h-2 rounded-full transition-all ${
                  index === stepIndex ? 'w-5 bg-primary-60' : 'w-2 bg-coolgray-30'
                }`}
              />
            ))}
          </ol>

          {/* 첫 단계에도 자리는 남겨 다음 버튼이 항상 오른쪽 끝에 오게 한다. */}
          <div className="flex w-full items-center justify-between gap-3">
            {isFirst ? (
              <span aria-hidden="true" />
            ) : (
              <Button variant="outlined" className="min-w-24" onClick={() => setStepIndex((index) => index - 1)}>
                이전
              </Button>
            )}
            <Button className="min-w-24" onClick={goNext}>
              {isLast ? '시작하기' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
