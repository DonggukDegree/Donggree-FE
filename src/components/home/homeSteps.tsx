/** [홈 > 이용 방법] 세 단계 안내 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef, useState } from 'react';

import Chart from '@/assets/icons/chart.svg?react';
import Edit from '@/assets/icons/edit.svg?react';
import Inbox from '@/assets/icons/inbox.svg?react';

gsap.registerPlugin(useGSAP);

const STEPS = [
  {
    icon: Inbox,
    title: 'PDF 업로드',
    description: '취득교과목 영역별 분류표 PDF를 업로드하세요.',
    caption: '파일 하나로 시작해요.',
    detail: 'nDRIMS에서 내려받은 취득교과목 영역별 분류표를 준비해주세요.',
    file: '취득교과목 영역별 분류표.pdf',
  },
  {
    icon: Chart,
    title: '학업 리포트 확인',
    description: '이수 현황과 남은 학점·필수 과목을 리포트에서 확인해요.',
    caption: '졸업까지 얼마나 남았을까?',
    detail: 'PDF의 수강 이력을 졸업 요건과 비교해 영역별 달성률과 부족한 항목을 알려드려요.',
    file: '영역별 달성률 · 잔여 학점 · 미충족 사유',
  },
  {
    icon: Edit,
    title: '내 학업 정보 관리',
    description: '마이페이지에서 수강 이력을 편집해 다양한 시뮬레이션을 할 수 있어요.',
    caption: '수정한 이력으로 미래를 계획해요.',
    detail:
      '내 학업 정보 관리에서 기존 성적을 수정하거나 앞으로 들을 과목을 추가하고, 달라진 이수 내역에 따른 새로운 리포트를 확인할 수 있어요.',
    file: '수강 학기 및 과목 추가 · 삭제 · 성적 편집 등',
  },
] as const;

export default function HomeSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const current = STEPS[activeStep] ?? STEPS[0];
  const StepIcon = current.icon;
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap
            .timeline({ defaults: { duration: 0.5, ease: 'power3.out' } })
            .from('.home-step-illustration', { scale: 0.8, rotation: -12, autoAlpha: 0 })
            .from('[data-step-enter]', { y: 14, autoAlpha: 0, stagger: 0.08 }, 0.15)
            .from('.home-step-check', { scale: 0, ease: 'back.out(1.7)' }, 0.5);
        },
        panel,
      );
      return () => media.revert();
    },
    { scope: panel, dependencies: [activeStep], revertOnUpdate: true },
  );

  return (
    <section className="home-container home-how" aria-labelledby="home-how-title">
      <div className="home-how-heading" data-home-reveal>
        <h2 id="home-how-title" className="text-heading-4 lg:text-heading-2">
          현황 파악부터 졸업 시뮬레이션까지,
          <br />
          남은 학기 계획도 동그리에서!
        </h2>
        <p className="text-body-m lg:text-body-l text-coolgray-60">
          기존 학업 정보를 편집하고, 미래 리포트도 그려볼 수 있어요.
        </p>
      </div>
      <div className="home-step-picker" aria-label="이용 단계 선택">
        {STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            aria-pressed={activeStep === index}
            aria-controls="home-step-preview"
            onClick={() => setActiveStep(index)}
          >
            <span className="home-step-number text-heading-5">0{index + 1}</span>
            <span>
              <strong className="text-heading-6 lg:text-heading-5">{step.title}</strong>
              <span className="text-body-s text-coolgray-60">{step.description}</span>
            </span>
            <span className="home-step-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div ref={panel} id="home-step-preview" className="home-step-preview" aria-live="polite" aria-atomic="true">
        <div className="home-step-illustration" aria-hidden="true">
          <StepIcon />
        </div>
        <h3 className="text-heading-5 lg:text-heading-4" data-step-enter>
          {current.caption}
        </h3>
        <p className="text-body-m text-coolgray-60" data-step-enter>
          {current.detail}
        </p>
        <div className="home-step-file text-body-s" data-step-enter>
          <StepIcon aria-hidden="true" />
          <span>{current.file}</span>
          <span className="home-step-check text-primary-90" aria-hidden="true">
            ✓
          </span>
        </div>
      </div>
    </section>
  );
}
