/** [홈 > 랜딩] 소개와 리포트 체험 */
import '@/components/home/home.css';

import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '@/assets/logo.svg?react';
import Button from '@/components/common/button';
import HomeOrbitVisual from '@/components/home/homeOrbitVisual';
import HomeReportPreview from '@/components/home/homeReportPreview';
import HomeSteps from '@/components/home/homeSteps';
import useHomeMotion from '@/hooks/home/useHomeMotion';
import useSurveyPrompt from '@/hooks/survey/useSurveyPrompt';

export default function Home() {
  useSurveyPrompt();
  const navigate = useNavigate();
  const container = useRef<HTMLElement>(null);
  useHomeMotion(container);

  return (
    <main ref={container} className="home-page text-coolgray-90">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <Logo className="home-hero-logo" role="img" aria-label="동그리" data-hero-enter />
            <h1 id="home-title" className="text-heading-2 lg:text-heading-1" data-hero-enter>
              졸업까지 남은 길,
              <br />
              <span className="text-primary-90">동그리로 선명하게.</span>
            </h1>
            <p className="text-heading-6 lg:text-heading-5" data-hero-enter>
              동국대학교 학생을 위한 졸업 요건 길잡이
            </p>
            <p className="text-body-m lg:text-body-l text-coolgray-60" data-hero-enter>
              PDF 한 장만 업로드하면, 이수 현황을 자동 분석하고
              <br className="hidden lg:block" /> 부족한 학점과 필수 과목을 한눈에 보여드려요.
            </p>
            <div className="home-actions" data-hero-enter>
              <Button className="home-start-button" onClick={() => navigate('/graduation')}>
                졸업 판정 시작하기 <span aria-hidden="true">↗</span>
              </Button>
              <a
                className="home-text-link text-button-s"
                href="#home-intro"
                onClick={(event) => {
                  const target = document.getElementById('home-intro');
                  if (!target) return;
                  event.preventDefault();
                  target.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    block: 'start',
                  });
                }}
              >
                리포트 미리보기 <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <HomeOrbitVisual />
        </div>
      </section>

      <section id="home-intro" className="home-container home-intro" aria-labelledby="home-intro-title">
        <h2 id="home-intro-title" className="text-heading-4 lg:text-heading-2" data-home-reveal>
          “나, 졸업할 수 있을까?”
          <br />그 물음표를 함께 줄여가요.
        </h2>
        <div className="home-intro-copy text-body-m lg:text-body-l text-coolgray-60" data-home-reveal>
          <p>
            1학년도, 4학년도.
            <br />
            지금 내가 어디쯤인지 알면 남은 학기가 달라져요.
          </p>
          <p>
            더 이상 직접 계산할 필요 없이, 나에게 필요한 것만 바로 확인하세요. 동그리가 영역별 달성률부터 놓치기 쉬운
            필수 과목까지 자동으로 안내할게요.
          </p>
        </div>
      </section>
      <HomeReportPreview />
      <HomeSteps />
      <section className="home-container home-closing" aria-labelledby="home-closing-title">
        <div data-home-reveal>
          <Logo className="home-closing-logo" role="img" aria-label="동그리" />
          <h2 id="home-closing-title" className="text-heading-4 lg:text-heading-2">
            가장 쉽고 빠른 나만의 학업 로드맵,
            <br />
            동그리와 함께
          </h2>
          <p className="text-body-m text-coolgray-60">
            영역별 이수 현황을 확인하고 나만의 학업 로드맵을 그려보세요.
            <br />
            학업 이수 요건에 맞게 졸업 판정도 동그리로 한 번에!
          </p>
        </div>
        <div className="home-closing-actions" data-home-reveal>
          <Button className="home-start-button" onClick={() => navigate('/graduation')}>
            내 졸업 요건 확인하기 <span aria-hidden="true">↗</span>
          </Button>
          <Link className="home-text-link text-button-s" to="/faq">
            자주 묻는 질문 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
