export default function AdminGraduationRequirements() {
  return (
    <main className="flex-1 bg-coolgray-10/60 px-10 py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-body-m font-semibold text-primary-90">Admin Curriculum</p>
          <h1 className="text-heading-3 text-coolgray-90">졸업 요건 관리</h1>
          <p className="text-body-m text-coolgray-60">
            졸업 규칙과 요건 세트 관리는 다음 PR에서 같은 관리자 레이아웃 위에 연결합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-primary-60/20 bg-white p-10 text-body-m text-coolgray-60 shadow-sm">
          PR2에서 graduation_rule 조회/등록/수정, PR3에서 requirement_set 조합 UI를 추가할 예정입니다.
        </div>
      </div>
    </main>
  );
}
