/**
 * [관리자 > 졸업 요건 관리 > 졸업 세트 관리] 탭 컨트롤러 훅
 * 세트 조회 필터 · 세트 폼 입력 · 기존 세트 불러오기 · 저장(신규 POST / 수정 PUT)을 담당한다.
 * 세트에 포함할 규칙은 하단 공유 목록에서 고르므로 그 토글 핸들러도 함께 노출한다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { getAdminDepartments, getAdminRequirementSetDetail } from '@/apis/admin/graduationRequirement';
import type { TRequirementSetFormState } from '@/components/admin/requirementSet/requirementSetForm';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { REQUIREMENT_TRACK_LABEL } from '@/constants/requirementTrack';
import useSaveRequirementSet from '@/hooks/admin/mutations/useSaveRequirementSet';
import useAdminColleges from '@/hooks/admin/queries/useAdminColleges';
import useAdminDepartments from '@/hooks/admin/queries/useAdminDepartments';
import useAdminRequirementSets from '@/hooks/admin/queries/useAdminRequirementSets';
import { useModalStore } from '@/stores/modalStore';
import type { TAdminGraduationRule } from '@/types/admin/TGetGraduationRules';
import type {
  TRequirementSetCreateRequest,
  TRequirementSetFilters,
  TRequirementSetUpdateRequest,
  TRequirementTrack,
} from '@/types/admin/TRequirementSets';
import { findDepartmentForForm } from '@/utils/academicOrganization';
import { optionalText, toPositiveInteger, toRequirementSetForm } from '@/utils/adminForm';

const EMPTY_SET_FORM: TRequirementSetFormState = {
  id: null,
  departmentId: null,
  collegeName: '',
  departmentName: '',
  yearStart: '',
  yearEnd: '',
  // 과정 구분이 없는 학과가 대부분이라 ALL을 기본값으로 둔다.
  track: 'ALL',
  version: '',
  description: '',
  sheetImageUrl: '',
  active: true,
};

// 신규 생성(POST)과 수정(PUT)은 요청 본문이 다르므로 id 유무로 구분한다.
type TRequirementSetSavePayload =
  | {
      id: null;
      body: TRequirementSetCreateRequest;
    }
  | {
      id: number;
      body: TRequirementSetUpdateRequest;
    };

export default function useRequirementSetEditor() {
  const queryClient = useQueryClient();
  const openConfirm = useModalStore((state) => state.openConfirm);

  const [filterCollegeId, setFilterCollegeId] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TRequirementSetFilters>({});
  const [form, setForm] = useState<TRequirementSetFormState>(EMPTY_SET_FORM);
  const [ruleIds, setRuleIds] = useState<Set<number>>(new Set());
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { data: colleges = [] } = useAdminColleges();
  const { data: departments = [] } = useAdminDepartments();
  const selectedFilterCollegeId = filterCollegeId ? toPositiveInteger(filterCollegeId) : null;
  const { data: filterDepartments = [], isPending: isFilterDepartmentsLoading } = useAdminDepartments(
    selectedFilterCollegeId ?? undefined,
  );
  // 신규 단과대를 입력해도 다른 단과대의 학과가 선택지에 섞이지 않게 한다.
  const formDepartments = departments.filter(
    (department) => !form.collegeName.trim() || department.collegeName === form.collegeName.trim(),
  );
  const { data: requirementSets = [] } = useAdminRequirementSets(appliedFilters);
  const { mutate: saveRequirementSet, isPending: isSaving } = useSaveRequirementSet();

  // '검색'을 눌렀을 때만 조건을 확정해 세트 목록을 다시 조회한다.
  // (조건을 비우고 검색하면 전체 목록으로 돌아가므로 별도 초기화 버튼은 두지 않는다)
  const searchSets = () => {
    const collegeId = filterCollegeId.trim() ? toPositiveInteger(filterCollegeId) : null;
    const departmentId = filterDepartmentId.trim() ? toPositiveInteger(filterDepartmentId) : null;
    const year = filterYear.trim() ? toPositiveInteger(filterYear) : null;
    setAppliedFilters({
      ...(collegeId ? { collegeId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(year ? { year } : {}),
    });
  };

  // 단과대를 바꾸면 학과 선택은 초기화한다. (단과대-학과 종속 관계)
  const onCollegeChange = (value: string) => {
    setFilterCollegeId(value);
    setFilterDepartmentId('');
  };

  const newSet = () => {
    setForm(EMPTY_SET_FORM);
    setRuleIds(new Set());
  };

  const loadSet = async (setId: number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.GET_ADMIN_REQUIREMENT_SET_DETAIL(setId),
        queryFn: () => getAdminRequirementSetDetail(setId),
      });
      let department = departments.find((item) => item.id === detail.departmentId);
      // 단과대 필터로 좁혀진 departments에 없으면 전체 학과를 다시 조회해 매칭한다.
      if (!department) {
        const allDepartments = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.GET_ADMIN_DEPARTMENTS(),
          queryFn: () => getAdminDepartments(),
        });
        department = allDepartments.find((item) => item.id === detail.departmentId);
      }
      setForm(toRequirementSetForm(detail, department));
      setRuleIds(new Set(detail.graduationRuleIds));
    } catch {
      toast.error('졸업 요건 세트를 불러오지 못했어요.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const changeForm = (
    field: keyof TRequirementSetFormState,
    value: string | boolean | number | null | TRequirementTrack,
  ) => {
    setForm((prev) => {
      if (field === 'collegeName') {
        // value가 string이 아닐 때 'null'/'undefined' 문자열로 저장되지 않도록 방어한다.
        const collegeName = typeof value === 'string' ? value : '';
        return { ...prev, collegeName, departmentId: null, departmentName: '' };
      }
      if (field === 'departmentName') {
        const departmentName = typeof value === 'string' ? value : '';
        const matchedDepartment = findDepartmentForForm(departments, departmentName, prev.collegeName);
        return {
          ...prev,
          departmentId: matchedDepartment?.id ?? null,
          departmentName,
          collegeName: prev.collegeName || matchedDepartment?.collegeName || '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const buildRequest = (): TRequirementSetSavePayload | null => {
    const collegeName = form.collegeName.trim();
    const departmentName = form.departmentName.trim();
    const yearStart = toPositiveInteger(form.yearStart);
    const yearEnd = toPositiveInteger(form.yearEnd);

    if (form.id === null && !collegeName) {
      toast.error('단과대를 입력해주세요.');
      return null;
    }
    if (form.id === null && !departmentName) {
      toast.error('학과를 입력해주세요.');
      return null;
    }
    if (!yearStart || !yearEnd) {
      toast.error('적용 시작/종료년도를 입력해주세요.');
      return null;
    }
    if (yearStart > yearEnd) {
      toast.error('적용 시작년도는 종료년도보다 클 수 없습니다.');
      return null;
    }
    if (ruleIds.size === 0) {
      toast.error('세트에 포함할 졸업 규칙을 선택해주세요.');
      return null;
    }

    const baseBody = {
      yearStart,
      yearEnd,
      track: form.track,
      description: optionalText(form.description),
      sheetImageUrl: optionalText(form.sheetImageUrl),
      active: form.active,
      graduationRuleIds: Array.from(ruleIds),
    };

    if (form.id === null) {
      return {
        id: null,
        body: {
          collegeName,
          departmentName,
          ...baseBody,
        },
      };
    }

    return {
      id: form.id,
      body: baseBody,
    };
  };

  const submit = () => {
    const payload = buildRequest();
    if (!payload) return;

    openConfirm({
      title: '졸업 요건 세트 저장',
      action: `${payload.id === null ? '신규 세트 생성' : `세트 ID ${payload.id} 수정`} · 규칙 ${payload.body.graduationRuleIds.length}건 연결`,
      description: '세트는 학과와 입학년도에 적용되는 졸업 판정 기준입니다. 저장 전 내용을 확인해주세요.',
      confirmText: '저장하기',
      cancelText: '취소하기',
      details: (
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-body-s">
          <dt className="text-coolgray-60">단과대</dt>
          <dd className="font-semibold text-coolgray-90">{form.collegeName || '기존 값 유지'}</dd>
          <dt className="text-coolgray-60">학과</dt>
          <dd className="font-semibold text-coolgray-90">{form.departmentName || '기존 값 유지'}</dd>
          <dt className="text-coolgray-60">적용년도</dt>
          <dd className="text-coolgray-90">
            {payload.body.yearStart} - {payload.body.yearEnd}
          </dd>
          <dt className="text-coolgray-60">과정</dt>
          <dd className="text-coolgray-90">{REQUIREMENT_TRACK_LABEL[payload.body.track]}</dd>
          <dt className="text-coolgray-60">버전</dt>
          <dd className="text-coolgray-90">{payload.id === null ? '자동 채번' : '서버 관리'}</dd>
          <dt className="text-coolgray-60">활성</dt>
          <dd className="text-coolgray-90">{payload.body.active ? '활성' : '비활성'}</dd>
        </dl>
      ),
      onConfirm: () => {
        saveRequirementSet(payload, {
          onSuccess: () => {
            toast.success('졸업 요건 세트를 저장했어요.');
            newSet();
          },
        });
      },
    });
  };

  // 하단 공유 테이블 행 토글(세트 모드): 세트에 포함할 규칙 id를 추가/제거한다.
  const toggleRule = (ruleId: number, checked: boolean) => {
    setRuleIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(ruleId);
      } else {
        next.delete(ruleId);
      }
      return next;
    });
  };

  // 하단 공유 테이블 전체 토글(세트 모드): 현재 목록의 규칙들을 일괄 포함/제외한다.
  const toggleAllRules = (rules: TAdminGraduationRule[], checked: boolean) => {
    setRuleIds((prev) => {
      const next = new Set(prev);
      rules.forEach((rule) => {
        if (checked) {
          next.add(rule.id);
        } else {
          next.delete(rule.id);
        }
      });
      return next;
    });
  };

  return {
    colleges,
    departments,
    filterDepartments,
    formDepartments,
    isFilterDepartmentsLoading,
    requirementSets,
    filterCollegeId,
    filterDepartmentId,
    filterYear,
    onCollegeChange,
    onDepartmentChange: setFilterDepartmentId,
    onYearChange: setFilterYear,
    searchSets,
    form,
    ruleIds,
    isLoadingDetail,
    changeForm,
    newSet,
    loadSet,
    submit,
    isSaving,
    toggleRule,
    toggleAllRules,
  };
}
