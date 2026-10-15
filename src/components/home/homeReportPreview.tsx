/** [홈 > 리포트 체험] 리포트 미리보기 */
import { lazy, Suspense, useState } from 'react';

import type { TDemoStage } from '@/components/home/homeReportAutodemo';
import useInView from '@/hooks/useInView';

const HomeReportAutodemo = lazy(() => import('@/components/home/homeReportAutodemo'));

const STEPS = ['PDF 업로드', '자동 분석', '리포트 확인'] as const;
const DEMO_PLACEHOLDER = (
  <div className="home-demo-column" aria-hidden="true">
    <div className="home-demo-shell">
      <div className="home-demo-toolbar" />
      <div className="home-demo-screen" />
    </div>
  </div>
);

export default function HomeReportPreview() {
  const [stage, setStage] = useState<TDemoStage>('upload');
  const [previewRef, isPreviewVisible] = useInView(0);
  const currentStep = stage === 'upload' ? 0 : stage === 'analyzing' ? 1 : 2;

  return (
    <section id="report-preview" className="home-preview-section" aria-labelledby="home-preview-title">
      <div className="home-container home-preview-layout">
        <div className="home-preview-copy">
          <h2 id="home-preview-title" className="text-heading-4 lg:text-heading-2">
            졸업까지 얼마나 남았는지
            <br />
            일일이 찾아보기 어렵다면
          </h2>
          <p className="text-body-m lg:text-body-l text-coolgray-60">
            동그리가 수강 이력에 맞춰 영역별로 부족한 학점과 들어야 할 과목을 모두 알기 쉽게 정리해 드려요.
          </p>
          <ol className="home-preview-steps" aria-label="시연 순서">
            {STEPS.map((step, index) => (
              <li
                key={step}
                data-demo-step={index}
                data-active={currentStep === index}
                data-complete={currentStep > index}
              >
                <span className="home-preview-step-index text-body-s">0{index + 1}</span>
                <span className="text-heading-6">{step}</span>
                <span className="home-preview-step-check text-primary-90" aria-hidden="true">
                  ✓
                </span>
              </li>
            ))}
          </ol>
        </div>
        {/* 시연 영역의 크기를 먼저 확보하고, 화면에 접근할 때 실제 리포트 코드를 받는다. */}
        <div ref={previewRef} className="min-w-0">
          {isPreviewVisible ? (
            <Suspense fallback={DEMO_PLACEHOLDER}>
              <HomeReportAutodemo onStageChange={setStage} />
            </Suspense>
          ) : (
            DEMO_PLACEHOLDER
          )}
        </div>
      </div>
    </section>
  );
}
