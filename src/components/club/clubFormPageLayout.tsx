/**
 * [동아리] 폼 페이지 틀
 * 등록·정보 수정·모집 등록 페이지가 같은 폭과 제목 줄을 쓴다.
 */
import type { ReactNode } from 'react';

export default function ClubFormPageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-180 flex-col gap-6 px-4 py-8 lg:gap-10 lg:py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-4 lg:text-heading-3 text-coolgray-90">{title}</h1>
        {subtitle && <p className="break-keep text-body-s lg:text-body-m text-coolgray-60">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
