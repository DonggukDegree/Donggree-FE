import { useNavigate } from 'react-router-dom';

import Icon from '@/assets/icon.svg?react';
import Chart from '@/assets/icons/chart.svg?react';
import Folder from '@/assets/icons/folder.svg?react';
import Inbox from '@/assets/icons/inbox.svg?react';
import Rocket from '@/assets/icons/rocket.svg?react';
import Warning from '@/assets/icons/warning.svg?react';
import Button from '@/components/common/button';
import useInView from '@/hooks/useInView';

const STEPS = [
  {
    icon: Inbox,
    step: '01',
    title: 'PDF 업로드',
    description: '취득교과목 영역별 분류표\nPDF를 업로드하세요.',
  },
  {
    icon: Chart,
    step: '02',
    title: '자동 분석',
    description: '이수 현황과 졸업 요건을\n자동으로 분석합니다.',
  },
  {
    icon: Rocket,
    step: '03',
    title: '결과 확인',
    description: '영역별 달성률과 부족한\n학점을 한눈에 확인하세요.',
  },
] as const;

const FEATURES = [
  {
    icon: Chart,
    title: '졸업 달성률',
    description: '전체 이수 학점과 졸업까지의 진행률을 한눈에 보여드립니다.',
  },
  {
    icon: Folder,
    title: '영역별 이수 현황',
    description: '공통교양, 전공필수, 전공선택 등 영역별 충족 여부를 자동 판별합니다.',
  },
  {
    icon: Warning,
    title: '부족 학점 안내',
    description: '졸업까지 남은 학점과 미이수 과목을 정리해 놓치는 것 없이 안내합니다.',
  },
] as const;

const sectionStyles = 'w-full flex flex-col items-center justify-center';

export default function Home() {
  const navigate = useNavigate();
  const [heroRef, heroInView] = useInView();
  const [ctaRef, ctaInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [bottomRef, bottomInView] = useInView();

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        ref={heroRef}
        className={`w-full flex items-center justify-between bg-primary-30 p-20 ${heroInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-start gap-12">
          <div className="text-heading-1 text-coolgray-90">
            <p>현재 이수 현황부터 남은 졸업 요건까지,</p>
            <p>동그리로 한 번에 관리하세요</p>
          </div>
          <div className="flex flex-col items-start text-body-l text-coolgray-60">
            <p>PDF 한 장만 업로드하면, 이수 현황을 자동 분석하고 부족한 학점을 대신 찾아 한 눈에 보여 드립니다.</p>
            <p>더 이상 직접 계산할 필요 없이, 나에게 필요한 것만 바로 확인하세요.</p>
            <p>학업 이수 요건에 맞게 졸업 판정도 동그리로 한 번에!</p>
          </div>
          <Button className="w-70 text-body-l animate-glow-pulse" onClick={() => navigate('/graduation')}>
            졸업 판정 시작하기
          </Button>
        </div>
        <Icon />
      </div>

      <div ref={ctaRef} className={`${sectionStyles} gap-8 p-30 ${ctaInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <p className="text-heading-2 text-coolgray-90">가장 쉽고 빠른 나만의 학업 로드맵, 동그리와 함께</p>
        <div className="flex flex-col items-center text-body-l text-coolgray-60">
          <p>1학년도, 4학년도. 지금 내가 어디쯤인지 알면 남은 학기가 달라져요.</p>
          <p>영역별 이수 현황을 확인하고 나만의 학업 로드맵을 그려보세요.</p>
          <p>동그리가 영역별 달성률부터 놓치기 쉬운 필수 과목까지 자동으로 정리해드려요.</p>
        </div>
      </div>

      <div
        ref={stepsRef}
        className={`${sectionStyles} p-20 gap-15 ${stepsInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <p className="text-heading-2 text-coolgray-90">3단계로 끝나는 졸업 판정</p>
        <div className="flex items-start gap-20">
          {STEPS.map(({ icon: StepIcon, step, title, description }) => (
            <div key={step} className="flex w-60 flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-3">
                <StepIcon className="h-16 w-16" />
                <span className="text-heading-3 text-primary-60">{step}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-heading-4 text-coolgray-90">{title}</p>
                <p className="whitespace-pre-line text-center text-body-m text-coolgray-60">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={featuresRef}
        className={`${sectionStyles} p-20 gap-15 ${featuresInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center gap-3">
          <p className="text-heading-2 text-coolgray-90">학업 리포트에서 확인하세요</p>
          <p className="text-body-l text-coolgray-60">동그리가 졸업까지 남은 길을 안내해 드릴게요.</p>
        </div>
        <div className="flex items-stretch gap-8">
          {FEATURES.map(({ icon: FeatureIcon, title, description }) => (
            <div
              key={title}
              className="flex w-80 flex-col items-center gap-5 rounded-xl border border-coolgray-20 bg-white p-10"
            >
              <FeatureIcon className="h-12 w-12" />
              <p className="text-heading-5 text-coolgray-90">{title}</p>
              <p className="text-center text-body-m text-coolgray-60">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={bottomRef}
        className={`w-full flex justify-center pt-10 pb-30 ${bottomInView ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <Button className="w-80 text-body-l animate-glow-pulse" onClick={() => navigate('/graduation')}>
          동그리를 지금 바로 사용해보세요!
        </Button>
      </div>
    </div>
  );
}
