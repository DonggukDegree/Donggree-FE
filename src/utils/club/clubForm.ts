/**
 * [동아리] 등록·수정·모집 폼 변환과 검증
 * 필수: 이름·소개(100자 이상)·소속 분류·활동 분야(1~3개)·창립일(날짜 또는 모름)·동아리방(위치 또는 없음), 기수제면 기수와 활동 기간.
 * 승인이 필요한 요청이면 요청자 연락처와 수집 동의도 필수. 사진·운영진·인원은 선택.
 * is…Complete는 필수 칸이 다 찼는지만 본다(제출 버튼 활성화용). 형식 오류는 제출할 때 validate…가 알려준다.
 */
import { CLUB_LIMITS } from '@/constants/club';
import type {
  TClubDetail,
  TClubLink,
  TClubRecruitment,
  TClubRecruitmentSaveRequest,
  TClubSaveRequest,
  TClubSaveValue,
} from '@/types/club/TClub';
import type {
  TClubForm,
  TClubFormErrors,
  TClubLinkRow,
  TClubOfficerRow,
  TClubRecruitmentForm,
  TClubRecruitmentFormErrors,
} from '@/types/club/TClubForm';
import { isValidContact, isValidHttpsUrl } from '@/utils/club/club';

let rowSequence = 0;
export const createRowKey = (prefix: string) => `${prefix}-${++rowSequence}`;

export const createOfficerRow = (): TClubOfficerRow => ({
  key: createRowKey('officer'),
  role: '',
  department: '',
  name: '',
});

// 관련 링크 행(동아리 정보·모집 공용, 최대 3개). 이름·주소 모두 비운 행은 저장하지 않는다.
// 하나라도 쓴 행은 이름 1~10자와 https 주소가 모두 있어야 한다.
export const createLinkRow = (): TClubLinkRow => ({ key: createRowKey('link'), label: '', url: '' });
const toLinkRows = (links: TClubLink[]): TClubLinkRow[] =>
  links.map((link) => ({ key: createRowKey('link'), ...link }));
export const toLinks = (rows: TClubLinkRow[]): TClubLink[] =>
  rows
    .filter((row) => row.label.trim() || row.url.trim())
    .map(({ label, url }) => ({ label: label.trim(), url: url.trim() }));
const getLinkError = (rows: TClubLinkRow[]): string | undefined => {
  const filled = rows.filter((row) => row.label.trim() || row.url.trim());
  const label = (row: TClubLinkRow) => row.label.trim().length;
  if (filled.some((row) => label(row) < 1 || label(row) > CLUB_LIMITS.LINK_LABEL_MAX))
    return `링크 이름을 1~${CLUB_LIMITS.LINK_LABEL_MAX}자로 입력해주세요.`;
  if (filled.some((row) => !isValidHttpsUrl(row.url))) return 'https://로 시작하는 주소를 입력해주세요.';
  return undefined;
};

export const addLinkRow = (rows: TClubLinkRow[]) =>
  rows.length >= CLUB_LIMITS.LINKS_MAX ? rows : [...rows, createLinkRow()];
export const changeLinkRow = (rows: TClubLinkRow[], key: string, patch: Partial<TClubLinkRow>) =>
  rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
export const removeLinkRow = (rows: TClubLinkRow[], key: string) => rows.filter((row) => row.key !== key);

export const createEmptyClubForm = (): TClubForm => ({
  name: '',
  affiliation: null,
  fields: [],
  description: '',
  foundedDate: '',
  foundedUnknown: false,
  hasGeneration: true,
  generation: '',
  activityStartDate: '',
  activityEndDate: '',
  roomLocation: '',
  noRoom: false,
  generationMemberCount: '',
  totalMemberCount: '',
  officers: [],
  links: [],
  images: [],
  representativeImageKey: null,
  requesterRole: null,
  contact: '',
  consent: false,
});

export const clubFormFromDetail = (club: TClubDetail): TClubForm => {
  const images = club.images.map((image) => ({
    key: createRowKey('image'),
    url: image.url,
    file: null,
    existingId: image.id,
  }));
  return {
    name: club.name,
    affiliation: club.affiliation,
    fields: [...club.fields],
    description: club.description,
    foundedDate: club.foundedDate ?? '',
    // 임시 등록 동아리는 창립일을 아직 모르는 상태라 '모름'으로 채우지 않는다.
    foundedUnknown: club.registration === 'OFFICIAL' && club.foundedDate === null,
    hasGeneration: club.generation !== null,
    generation: club.generation?.toString() ?? '',
    activityStartDate: club.activityStartDate ?? '',
    activityEndDate: club.activityEndDate ?? '',
    roomLocation: club.roomLocation ?? '',
    // 임시 등록 동아리는 동아리방을 아직 모르는 상태라 '없음'으로 채우지 않는다.
    noRoom: club.registration === 'OFFICIAL' && club.roomLocation === null,
    generationMemberCount: club.generationMemberCount?.toString() ?? '',
    totalMemberCount: club.totalMemberCount?.toString() ?? '',
    officers: club.officers.map((officer) => ({ key: createRowKey('officer'), ...officer })),
    links: toLinkRows(club.links),
    images,
    representativeImageKey: images.find((image) => image.existingId === club.representativeImageId)?.key ?? null,
    requesterRole: null,
    contact: '',
    consent: false,
  };
};

// 보냈던 요청(입력값)으로 폼을 다시 채운다. 반려·검토 중 요청을 고쳐서 다시 보낼 때 쓴다.
// 연락처·신분은 그대로 채우고 수집 동의는 새로 받는다. 사진은 보냈던 사진(정리돼 없어진 사진 제외)을 그대로 채운다.
export const clubFormFromSave = (body: TClubSaveValue): TClubForm => {
  const images = body.images.map((image) => ({
    key: createRowKey('image'),
    url: image.url,
    file: null,
    existingId: image.id,
  }));
  return {
    name: body.name,
    affiliation: body.affiliation,
    fields: [...body.fields],
    description: body.description,
    foundedDate: body.foundedDate ?? '',
    foundedUnknown: body.foundedDate === null,
    hasGeneration: body.generation !== null,
    generation: body.generation?.toString() ?? '',
    activityStartDate: body.activityStartDate ?? '',
    activityEndDate: body.activityEndDate ?? '',
    roomLocation: body.roomLocation ?? '',
    noRoom: body.roomLocation === null,
    generationMemberCount: body.generationMemberCount?.toString() ?? '',
    totalMemberCount: body.totalMemberCount?.toString() ?? '',
    officers: body.officers.map((officer) => ({ key: createRowKey('officer'), ...officer })),
    links: toLinkRows(body.links),
    images,
    representativeImageKey:
      images.find((image) => image.existingId === body.representativeImageId)?.key ?? images[0]?.key ?? null,
    requesterRole: body.requesterRole,
    contact: body.requesterContact ?? '',
    consent: false,
  };
};

const isPositiveInteger = (value: string) => /^\d+$/.test(value.trim()) && Number(value) > 0;
const isFilledOfficer = (row: TClubOfficerRow) => Boolean(row.role.trim() || row.department.trim() || row.name.trim());

export const validateClubForm = (form: TClubForm, needsApproval: boolean): TClubFormErrors => {
  const errors: TClubFormErrors = {};
  if (!form.name.trim()) errors.name = '동아리 이름을 입력해주세요.';
  if (!form.affiliation) errors.affiliation = '소속 분류를 골라주세요.';
  if (form.fields.length === 0) errors.fields = '활동 분야를 1개 이상 골라주세요.';
  if (form.description.trim().length < CLUB_LIMITS.DESCRIPTION_MIN)
    errors.description = `동아리 소개를 ${CLUB_LIMITS.DESCRIPTION_MIN}자 이상 입력해주세요.`;
  if (!form.foundedUnknown && !form.foundedDate)
    errors.foundedDate = '창립일자를 입력하거나 모르겠어요를 체크해주세요.';
  if (form.hasGeneration) {
    if (!isPositiveInteger(form.generation)) errors.generation = '현재 기수를 숫자로 입력해주세요.';
    if (!form.activityStartDate || !form.activityEndDate)
      errors.activityPeriod = '활동 시작일과 마감일을 입력해주세요.';
    else if (form.activityStartDate > form.activityEndDate) errors.activityPeriod = '마감일은 시작일 이후여야 해요.';
  }
  if (!form.noRoom && !form.roomLocation.trim())
    errors.roomLocation = '동아리방 위치를 입력하거나 없음을 체크해주세요.';
  if ([form.generationMemberCount, form.totalMemberCount].some((value) => value.trim() && !isPositiveInteger(value)))
    errors.memberCount = '인원은 숫자로 입력해주세요.';
  // 운영진은 한 칸이라도 쓴 행이면 직책·이름을 모두 채워야 한다. 학과는 선택.
  if (form.officers.some((row) => isFilledOfficer(row) && (!row.role.trim() || !row.name.trim())))
    errors.officers = '운영진은 직책과 이름을 함께 입력해주세요.';
  const linkError = getLinkError(form.links);
  if (linkError) errors.links = linkError;
  if (needsApproval) {
    if (!form.requesterRole) errors.requesterRole = '동아리와의 관계를 골라주세요.';
    if (!isValidContact(form.contact)) errors.contact = '확인 연락을 받을 이메일이나 전화번호를 입력해주세요.';
    if (!form.consent) errors.consent = '개인정보 수집·이용에 동의해주세요.';
  }
  return errors;
};

const optionalText = (value: string) => value.trim() || null;
const optionalNumber = (value: string) => (value.trim() ? Number(value) : null);

export const isClubFormComplete = (form: TClubForm, needsApproval: boolean) =>
  Boolean(
    form.name.trim() &&
    form.affiliation &&
    form.fields.length > 0 &&
    form.description.trim().length >= CLUB_LIMITS.DESCRIPTION_MIN &&
    (form.foundedUnknown || form.foundedDate) &&
    (!form.hasGeneration || (form.generation.trim() && form.activityStartDate && form.activityEndDate)) &&
    (form.noRoom || form.roomLocation.trim()) &&
    (!needsApproval || (form.requesterRole && form.contact.trim() && form.consent)),
  );

export const toClubSaveRequest = (form: TClubForm, needsApproval: boolean): TClubSaveRequest => ({
  name: form.name.trim(),
  affiliation: form.affiliation ?? 'CENTRAL',
  fields: form.fields,
  description: form.description.trim(),
  foundedDate: form.foundedUnknown ? null : form.foundedDate || null,
  generation: form.hasGeneration ? Number(form.generation) : null,
  activityStartDate: form.hasGeneration ? form.activityStartDate : null,
  activityEndDate: form.hasGeneration ? form.activityEndDate : null,
  roomLocation: form.noRoom ? null : optionalText(form.roomLocation),
  generationMemberCount: optionalNumber(form.generationMemberCount),
  totalMemberCount: optionalNumber(form.totalMemberCount),
  officers: form.officers
    .filter(isFilledOfficer)
    .map(({ role, department, name }) => ({ role: role.trim(), department: department.trim(), name: name.trim() })),
  links: toLinks(form.links),
  // 올리기가 끝난 사진만 보낸다(올리는 중에는 제출 버튼이 꺼져 있다).
  imageIds: form.images.flatMap((image) => (image.existingId === null ? [] : [image.existingId])),
  representativeImageId: form.images.find((image) => image.key === form.representativeImageKey)?.existingId ?? null,
  requesterContact: needsApproval ? form.contact.trim() : null,
  requesterRole: needsApproval ? form.requesterRole : null,
});

// 고른 사진 파일 검사(크롭 전 원본). 형식·용량·장수 초과 사유를 돌려주고, 문제가 없으면 null.
export const validateClubImageFile = (file: File, currentCount: number): string | null => {
  if (currentCount >= CLUB_LIMITS.IMAGES_MAX) return `사진은 최대 ${CLUB_LIMITS.IMAGES_MAX}장까지 올릴 수 있어요.`;
  if (!(CLUB_LIMITS.IMAGE_TYPES as readonly string[]).includes(file.type))
    return 'JPG, PNG, WEBP 사진만 올릴 수 있어요.';
  if (file.size > CLUB_LIMITS.IMAGE_SOURCE_BYTES_MAX) return '사진은 한 장에 20MB 이하만 고를 수 있어요.';
  return null;
};

// 날짜 입력칸 글자색. 비어 있으면 연·월·일 자리 표시를 회색, 값이 있으면 본문색으로 통일한다.
export const dateTextClass = (value: string) => (value ? 'text-coolgray-90' : 'text-coolgray-60');

// ISO ↔ datetime-local 입력값('YYYY-MM-DDTHH:mm', 브라우저 시간대 = 한국시간)
export const toDateTimeLocal = (iso: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : null);

export const createRecruitmentForm = (
  recruitment: TClubRecruitment | null,
  generation: number | null,
): TClubRecruitmentForm => ({
  generation: (recruitment?.generation ?? generation)?.toString() ?? '',
  alwaysOpen: recruitment?.alwaysOpen ?? false,
  startsAt: toDateTimeLocal(recruitment?.startsAt ?? null),
  endsAt: toDateTimeLocal(recruitment?.endsAt ?? null),
  closedEarly: recruitment?.closedEarly ?? false,
  links: toLinkRows(recruitment?.links ?? []),
  notice: recruitment?.notice ?? '',
  requesterRole: null,
  contact: '',
  consent: false,
});

// 보냈던 모집 요청(입력값)으로 폼을 다시 채운다. 연락처·신분은 그대로, 수집 동의는 새로 받는다.
export const recruitmentFormFromSave = (body: TClubRecruitmentSaveRequest): TClubRecruitmentForm => ({
  generation: body.generation?.toString() ?? '',
  alwaysOpen: body.alwaysOpen,
  startsAt: toDateTimeLocal(body.startsAt),
  endsAt: toDateTimeLocal(body.endsAt),
  closedEarly: body.closedEarly,
  links: toLinkRows(body.links),
  notice: body.notice ?? '',
  requesterRole: body.requesterRole,
  contact: body.requesterContact ?? '',
  consent: false,
});

export const isRecruitmentFormComplete = (form: TClubRecruitmentForm, needsApproval: boolean) =>
  Boolean(
    (form.alwaysOpen || (form.startsAt && form.endsAt)) &&
    (!needsApproval || (form.requesterRole && form.contact.trim() && form.consent)),
  );

export const validateRecruitmentForm = (
  form: TClubRecruitmentForm,
  needsApproval: boolean,
): TClubRecruitmentFormErrors => {
  const errors: TClubRecruitmentFormErrors = {};
  if (form.generation.trim() && !isPositiveInteger(form.generation)) errors.generation = '기수는 숫자로 입력해주세요.';
  if (!form.alwaysOpen) {
    if (!form.startsAt || !form.endsAt) errors.period = '모집 시작·마감 일시를 입력해주세요.';
    else if (form.startsAt >= form.endsAt) errors.period = '마감 일시는 시작 일시 이후여야 해요.';
  }
  // 비워 둔 링크 행은 저장하지 않는다. 입력한 주소는 모두 https여야 한다.
  const linkError = getLinkError(form.links);
  if (linkError) errors.links = linkError;
  if (needsApproval) {
    if (!form.requesterRole) errors.requesterRole = '동아리와의 관계를 골라주세요.';
    if (!isValidContact(form.contact)) errors.contact = '확인 연락을 받을 이메일이나 전화번호를 입력해주세요.';
    if (!form.consent) errors.consent = '개인정보 수집·이용에 동의해주세요.';
  }
  return errors;
};

export const toRecruitmentSaveRequest = (
  form: TClubRecruitmentForm,
  needsApproval: boolean,
): TClubRecruitmentSaveRequest => ({
  generation: form.generation.trim() ? Number(form.generation) : null,
  alwaysOpen: form.alwaysOpen,
  startsAt: form.alwaysOpen ? null : fromDateTimeLocal(form.startsAt),
  endsAt: form.alwaysOpen ? null : fromDateTimeLocal(form.endsAt),
  closedEarly: form.closedEarly,
  links: toLinks(form.links),
  notice: optionalText(form.notice),
  requesterContact: needsApproval ? form.contact.trim() : null,
  requesterRole: needsApproval ? form.requesterRole : null,
});
