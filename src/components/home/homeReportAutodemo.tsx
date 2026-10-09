/** [홈 > 리포트 체험] 실제 리포트 자동 시연 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef, useState } from 'react';

import Upload from '@/assets/icons/upload.svg?react';
import Button from '@/components/common/button';
import Loading from '@/components/common/loading';
import GraduationReport from '@/components/report/graduationReport';
import { REPORT_EXAMPLE, REPORT_EXAMPLE_DETAILS } from '@/constants/home/reportExample';

export type TDemoStage = 'upload' | 'analyzing' | 'report';
interface IHomeReportAutodemoProps {
  onStageChange: (stage: TDemoStage) => void;
}
export default function HomeReportAutodemo({ onStageChange }: IHomeReportAutodemoProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fileButtonRef = useRef<HTMLButtonElement>(null);
  const analyzeButtonRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const reportScrollRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<TDemoStage>('upload');
  const [fileSelected, setFileSelected] = useState(false);
  const [paused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useGSAP(
    () => {
      const scene = stageRef.current;
      const touch = touchRef.current;
      if (!scene || !touch) return;
      scene.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]').forEach((control) => {
        control.tabIndex = -1;
      });
      if (scene.contains(document.activeElement) && document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      if (paused) return;
      const pointTo = (target: Element | null, offsetX = 0.5, offsetY = 0.6) => {
        const bounds = target?.getBoundingClientRect();
        const sceneBounds = scene.getBoundingClientRect();
        return {
          x: (bounds?.left ?? sceneBounds.left) - sceneBounds.left + (bounds?.width ?? 0) * offsetX,
          y: (bounds?.top ?? sceneBounds.top) - sceneBounds.top + (bounds?.height ?? 0) * offsetY,
        };
      };
      const scrollTo = (section: string) => {
        const scroller = reportScrollRef.current;
        const target = scroller?.querySelector<HTMLElement>(`[data-report-section="${section}"]`);
        if (!scroller || !target) return 0;
        return scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 20;
      };
      const scrollVertically = (timeline: gsap.core.Timeline, section: string, duration: number) => {
        const scroller = reportScrollRef.current;
        if (!scroller) return;
        timeline.to(touch, {
          x: () => pointTo(scroller, 0.88, 0.82).x,
          y: () => pointTo(scroller, 0.88, 0.82).y,
          duration: 0.28,
          ease: 'power1.inOut',
        });
        timeline.to(scroller, { scrollTop: () => scrollTo(section), duration, ease: 'power2.inOut' });
        timeline.to(
          touch,
          {
            x: () => pointTo(scroller, 0.88, 0.18).x,
            y: () => pointTo(scroller, 0.88, 0.18).y,
            duration,
            ease: 'power2.inOut',
          },
          '<',
        );
      };
      const moveTo = (timeline: gsap.core.Timeline, target: Element | null) => {
        timeline.to(touch, {
          ...pointTo(target),
          x: () => pointTo(target).x,
          y: () => pointTo(target).y,
          duration: 0.72,
          ease: 'power2.inOut',
        });
      };
      const click = (timeline: gsap.core.Timeline, target: Element | null) => {
        moveTo(timeline, target);
        timeline.to(touch, { scale: 0.78, duration: 0.13, ease: 'power1.out' });
        if (rippleRef.current) {
          timeline.fromTo(
            rippleRef.current,
            { scale: 0.7, autoAlpha: 0.85 },
            { scale: 1.9, autoAlpha: 0, duration: 0.34, ease: 'power1.out' },
            '<',
          );
        }
        timeline.call(() => {
          if (target instanceof HTMLElement && !(target instanceof HTMLButtonElement && target.disabled))
            target.click();
        });
        timeline.to(touch, { scale: 1, duration: 0.22, ease: 'back.out(2)' });
      };

      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
      if (stage === 'upload') {
        gsap.set(touch, { autoAlpha: 0, x: 0, y: -28, xPercent: -50, yPercent: -50, scale: 1 });
        timeline.to(touch, { autoAlpha: 1, duration: 0.22 }, 0.4);
        click(timeline, fileButtonRef.current);
        timeline.to({}, { duration: 0.4 });
        click(timeline, analyzeButtonRef.current?.querySelector('button') ?? null);
      } else if (stage === 'analyzing') {
        gsap.set(touch, { autoAlpha: 0 });
        timeline.to({}, { duration: 1.26 });
        timeline.call(() => {
          setStage('report');
          onStageChange('report');
        });
      } else {
        const scroller = reportScrollRef.current;
        const overviewCards = scroller?.querySelector<HTMLElement>('[data-report-section="overview-cards"]');
        const detailTabs =
          scroller?.querySelectorAll<HTMLButtonElement>('[data-report-section="details"] button') ?? [];
        const academicFoundationTab =
          Array.from(detailTabs).find((tab) => tab.textContent?.trim() === '학문기초') ?? null;
        const commonGeneralTab = Array.from(detailTabs).find((tab) => tab.textContent?.trim() === '공통교양') ?? null;
        const reportActions =
          scroller?.querySelectorAll<HTMLButtonElement>('[data-report-section="actions"] button') ?? [];
        const editButton =
          Array.from(reportActions).find((button) => button.textContent?.trim() === '내 학업 정보 수정') ?? null;
        if (scroller) scroller.scrollTop = 0;
        gsap.set(touch, { autoAlpha: 0, x: 4, y: 56, xPercent: -50, yPercent: -50, scale: 1 });
        timeline.to(touch, { autoAlpha: 1, duration: 0.3 }, 0.4);
        timeline.to({}, { duration: 0.55 });
        scrollVertically(timeline, 'areas', 0.9);
        if (overviewCards) {
          timeline.to(touch, {
            x: () => pointTo(overviewCards, 0.88, 0.55).x,
            y: () => pointTo(overviewCards, 0.88, 0.55).y,
            duration: 0.28,
            ease: 'power1.inOut',
          });
          timeline.to(overviewCards, {
            scrollLeft: () => Math.max(0, overviewCards.scrollWidth - overviewCards.clientWidth),
            duration: 1.8,
            ease: 'power2.inOut',
          });
          timeline.to(
            touch,
            {
              x: () => pointTo(overviewCards, 0.12, 0.55).x,
              y: () => pointTo(overviewCards, 0.12, 0.55).y,
              duration: 1.8,
              ease: 'power2.inOut',
            },
            '<',
          );
        }
        timeline.to({}, { duration: 0.35 });
        scrollVertically(timeline, 'details', 0.85);
        click(timeline, academicFoundationTab);
        timeline.to({}, { duration: 1.1 });
        click(timeline, commonGeneralTab);
        timeline.to({}, { duration: 0.8 });
        scrollVertically(timeline, 'actions', 0.85);
        click(timeline, editButton);
        timeline.call(() => {
          setFileSelected(false);
          setStage('upload');
          onStageChange('upload');
        });
      }

      // 화면이 보일 때만 시연한다.
      let inView = false;
      const syncPlayback = () => {
        if (inView && !document.hidden) timeline.play();
        else timeline.pause();
      };
      const observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry?.isIntersecting ?? false;
          syncPlayback();
        },
        { threshold: 0.12 },
      );
      observer.observe(scene);
      document.addEventListener('visibilitychange', syncPlayback);
      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', syncPlayback);
      };
    },
    { scope: stageRef, dependencies: [stage, paused, onStageChange], revertOnUpdate: true },
  );

  return (
    <div className="home-demo-column">
      <div className="home-demo-shell">
        <div className="home-demo-toolbar">
          <span className="home-demo-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div
          ref={stageRef}
          className="home-demo-screen"
          data-stage={stage}
          role="img"
          aria-label="PDF 업로드부터 학업 리포트 확인까지 자동 재생되는 동그리 시연"
        >
          {stage === 'upload' && (
            <div className="home-demo-upload-view">
              <div className="home-demo-upload-heading text-center">
                <h3 className="text-heading-4 lg:text-heading-2">PDF 업로드</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-heading-6 lg:text-heading-4">취득교과목 영역별 분류표 PDF를 업로드해주세요</p>
                  <p className="text-body-s lg:text-heading-5 text-coolgray-60">
                    최초 1번만 업로드하면 재업로드 없이 졸업 판정이 가능합니다.
                  </p>
                </div>
              </div>
              <div className="home-demo-dropzone">
                {fileSelected ? (
                  <>
                    <p className="text-heading-6 lg:text-heading-4 text-primary-60 max-lg:px-4 max-lg:text-center max-lg:break-all">
                      취득교과목_영역별분류표.pdf
                    </p>
                    <p className="text-body-s lg:text-body-l text-primary-60">업로드 완료</p>
                    <button
                      ref={fileButtonRef}
                      type="button"
                      className="text-body-m text-coolgray-60 underline cursor-pointer hover:opacity-80"
                      onClick={() => setFileSelected(false)}
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      ref={fileButtonRef}
                      type="button"
                      className="p-4 cursor-pointer hover:opacity-80"
                      onClick={() => setFileSelected(true)}
                      aria-label="PDF 파일 선택"
                    >
                      <Upload className="w-12 h-12 lg:w-24 lg:h-24" />
                    </button>
                    <p className="text-body-s lg:text-body-l max-lg:text-center">
                      다운로드 받은 최신 PDF를 업로드해주세요.
                    </p>
                  </>
                )}
              </div>
              <p className="text-body-s lg:text-body-l text-coolgray-60 max-lg:text-center">
                동그리는 PDF에서 졸업 판정에 필요하지 않은 정보를 수집하지 않습니다.
              </p>
              <div ref={analyzeButtonRef}>
                <Button
                  className="px-15 max-w-full text-body-m lg:text-body-l"
                  variant={fileSelected ? 'primary' : 'disabled'}
                  disabled={!fileSelected}
                  onClick={() => {
                    setStage('analyzing');
                    onStageChange('analyzing');
                  }}
                >
                  졸업 판정 시작
                </Button>
              </div>
            </div>
          )}
          {stage === 'analyzing' && (
            <div className="home-demo-analyzing">
              <Loading />
            </div>
          )}
          {stage === 'report' && (
            <div ref={reportScrollRef} className="home-demo-report-scroll" aria-label="자동 재생 중인 실제 학업 리포트">
              <GraduationReport
                data={REPORT_EXAMPLE}
                preview={{ details: REPORT_EXAMPLE_DETAILS, onEdit: () => undefined }}
              />
            </div>
          )}
          <div ref={touchRef} className="home-demo-touch" aria-hidden="true">
            <span ref={rippleRef} className="home-demo-touch-ripple" />
          </div>
        </div>
      </div>
    </div>
  );
}
