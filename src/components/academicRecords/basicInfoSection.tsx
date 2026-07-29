/**
 * [내 학업 정보 관리] 기본 정보 섹션
 * 페이지 상단, 학기별 수강 내역 위에 놓이는 고정 텍스트 블록.
 * 성적표 메타 정보(교육과정 적용년도·학과·학적 상태·총 취득학점 등)를 2열로 보여 준다.
 * 부전공/복수전공·단과대학처럼 없을 수 있는 항목은 값이 있을 때만 줄이 생긴다.
 */
import { Fragment } from 'react';

import type { TReportMeta } from '@/types/report/TGetUserReports';

interface IBasicInfoSectionProps {
  meta: TReportMeta;
  className?: string;
}

export default function BasicInfoSection({ meta, className = '' }: IBasicInfoSectionProps) {
  // 지정된 순서대로 쌓는다. (선택 항목은 있을 때만 push)
  const items: { label: string; value: string | number }[] = [
    { label: '교육과정 적용년도', value: meta.admissionYear },
  ];
  if (meta.collegeName) items.push({ label: '단과대학', value: meta.collegeName });
  items.push({ label: '학과', value: meta.department });
  if (meta.subMajor1) items.push({ label: '부전공1', value: meta.subMajor1 });
  if (meta.subMajor2) items.push({ label: '부전공2', value: meta.subMajor2 });
  if (meta.dualMajor1) items.push({ label: '복수전공1', value: meta.dualMajor1 });
  if (meta.dualMajor2) items.push({ label: '복수전공2', value: meta.dualMajor2 });
  items.push({ label: '학적 상태', value: meta.academicStatus });
  items.push({ label: '이수 학기', value: `${meta.completedSemesters}학기` });
  items.push({ label: '총 취득학점', value: `${meta.totalCredits}학점` });
  items.push({ label: '평점 평균', value: meta.gpa });

  return (
    <div className={className}>
      <p className="text-heading-3 text-coolgray-90">기본 정보</p>
      {/* 블록 자체는 가운데 정렬하되, 값(2열)은 같은 시작점에서 왼쪽 정렬한다. */}
      <div className="grid grid-cols-[auto_auto] gap-x-40 gap-y-3">
        {items.map(({ label, value }) => (
          <Fragment key={label}>
            <span className="text-heading-5 text-coolgray-90">{label}</span>
            <span className="text-body-l text-coolgray-90">{value}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
