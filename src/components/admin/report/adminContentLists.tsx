/**
 * [관리자 > 신고 관리] 하단 전체 목록 (탭 연동)
 * 졸업 요건 화면의 규칙 목록처럼 위 신고 처리 아래에 표로 둔다. 장소 신고 탭은 장소 목록, 리뷰 신고 탭은 리뷰 목록,
 * 회원 탭은 회원 목록을 보여준다. 신고 여부와 관계없이 전체를 상태·처리 대기 신고 수와 함께 최신순 20개씩 본다.
 * 장소·리뷰 행에서 바로 숨김/해제(확인 모달)하고, 등록자·작성자·회원을 누르면 회원 상세로 넘어간다.
 */
import { type ReactNode, useState } from 'react';

import TruncatedCell from '@/components/admin/common/truncatedCell';
import AdminMemberCell from '@/components/admin/report/adminMemberCell';
import { FilterChips, KeywordSearch, PageControls } from '@/components/admin/report/reportListControls';
import { PLACE_CATEGORY_BY_VALUE, PLACE_SUB_CATEGORY_LABELS } from '@/constants/place';
import { useAdminPlaceVisibility, useAdminReviewVisibility } from '@/hooks/admin/mutations/useAdminReportActions';
import { useAdminMembers, useAdminPlaceList, useAdminReviewList } from '@/hooks/admin/queries/useAdminReports';
import useAdminConfirm from '@/hooks/admin/useAdminConfirm';
import type { TAdminPage, TAdminReviewState } from '@/types/admin/TAdminReport';
import {
  adminReviewStateLabel,
  formatAdminDateTime,
  isSuspendedNow,
  PLACE_STATUS_LABELS,
  placeVisibilityConfirm,
  reviewVisibilityConfirm,
} from '@/utils/admin/report';

const HEADER_CELL_CLASS = 'px-4 py-3 text-left text-body-s font-semibold text-primary-90';
const BODY_CELL_CLASS = 'px-4 py-3 text-body-s text-coolgray-90 align-middle';
const ROW_BUTTON_CLASS =
  'cursor-pointer rounded-lg border px-3 py-1.5 text-body-xs whitespace-nowrap disabled:cursor-default disabled:opacity-40';

const stateBadge = (label: string) =>
  `rounded-full px-2 py-0.5 text-body-xs ${label === '보임' || label === '정상' ? 'bg-primary-30 text-primary-90' : 'bg-alert/10 text-alert'}`;

export function PlaceListSection({ onSelectMember }: { onSelectMember: (memberId: number) => void }) {
  const [status, setStatus] = useState<'VISIBLE' | 'HIDDEN' | null>(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useAdminPlaceList(status, keyword, page);
  const visibility = useAdminPlaceVisibility();
  const confirm = useAdminConfirm();

  return (
    <ListSection
      title="장소 목록"
      data={data}
      toolbar={
        <>
          <FilterChips
            label="장소 상태"
            value={status}
            options={[
              { value: null, label: '전체' },
              { value: 'VISIBLE', label: '보임' },
              { value: 'HIDDEN', label: '숨김' },
            ]}
            onChange={(next) => {
              setStatus(next);
              setPage(0);
            }}
          />
          <KeywordSearch
            label="장소 검색"
            placeholder="장소 이름"
            onSearch={(next) => {
              setKeyword(next);
              setPage(0);
            }}
          />
        </>
      }
      onPage={setPage}
    >
      <ListTable
        columns={[
          { label: '장소', width: 'w-[22%]' },
          { label: '카테고리', width: 'w-[16%]' },
          { label: '상태', width: 'w-[8%]' },
          { label: '대기 신고', width: 'w-[9%]' },
          { label: '등록자', width: 'w-[25%]' },
          { label: '등록일', width: 'w-[12%]' },
          { label: '', width: 'w-[8%]' },
        ]}
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.items.length === 0}
        emptyText="조건에 맞는 장소가 없어요."
      >
        {data?.items.map((place) => {
          const category = PLACE_CATEGORY_BY_VALUE[place.category];
          const hidden = place.status === 'HIDDEN';
          return (
            <tr key={place.placeId} className="border-t border-coolgray-10 hover:bg-coolgray-10/50">
              <td className={BODY_CELL_CLASS}>
                <TruncatedCell text={place.name} className="font-semibold" />
              </td>
              <td className={BODY_CELL_CLASS}>
                {category.emoji} {category.label} · {PLACE_SUB_CATEGORY_LABELS[place.subCategory]}
              </td>
              <td className={BODY_CELL_CLASS}>
                <span className={stateBadge(PLACE_STATUS_LABELS[place.status])}>
                  {PLACE_STATUS_LABELS[place.status]}
                </span>
              </td>
              <td className={BODY_CELL_CLASS}>{place.pendingReportCount}건</td>
              <td className={BODY_CELL_CLASS}>
                <AdminMemberCell member={place.registrant} onSelect={onSelectMember} />
              </td>
              <td className={BODY_CELL_CLASS}>{formatAdminDateTime(place.createdAt)}</td>
              <td className={BODY_CELL_CLASS}>
                <button
                  type="button"
                  disabled={visibility.isPending}
                  onClick={() =>
                    confirm({
                      ...placeVisibilityConfirm(place.name, !hidden),
                      onConfirm: () => visibility.mutate({ placeId: place.placeId, hidden: !hidden }),
                    })
                  }
                  className={`${ROW_BUTTON_CLASS} ${
                    hidden
                      ? 'border-coolgray-30 text-coolgray-90 hover:border-primary-60'
                      : 'border-alert/40 text-alert hover:bg-alert/5'
                  }`}
                >
                  {hidden ? '숨김 해제' : '숨기기'}
                </button>
              </td>
            </tr>
          );
        })}
      </ListTable>
    </ListSection>
  );
}

export function ReviewListSection({ onSelectMember }: { onSelectMember: (memberId: number) => void }) {
  const [state, setState] = useState<TAdminReviewState | null>(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useAdminReviewList(state, keyword, page);
  const visibility = useAdminReviewVisibility();
  const confirm = useAdminConfirm();

  return (
    <ListSection
      title="리뷰 목록"
      data={data}
      toolbar={
        <>
          <FilterChips
            label="리뷰 상태"
            value={state}
            options={[
              { value: null, label: '전체' },
              { value: 'VISIBLE', label: '보임' },
              { value: 'HIDDEN', label: '숨김' },
              { value: 'DELETED', label: '작성자 삭제' },
            ]}
            onChange={(next) => {
              setState(next);
              setPage(0);
            }}
          />
          <KeywordSearch
            label="리뷰 검색"
            placeholder="본문·장소 이름"
            onSearch={(next) => {
              setKeyword(next);
              setPage(0);
            }}
          />
        </>
      }
      onPage={setPage}
    >
      <ListTable
        columns={[
          { label: '장소', width: 'w-[13%]' },
          { label: '별점', width: 'w-[6%]' },
          { label: '본문', width: 'w-[25%]' },
          { label: '상태', width: 'w-[8%]' },
          { label: '대기 신고', width: 'w-[8%]' },
          { label: '작성자', width: 'w-[20%]' },
          { label: '작성일', width: 'w-[12%]' },
          { label: '', width: 'w-[8%]' },
        ]}
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.items.length === 0}
        emptyText="조건에 맞는 리뷰가 없어요."
      >
        {data?.items.map((review) => {
          const label = adminReviewStateLabel(review);
          const hidden = review.status === 'HIDDEN';
          return (
            <tr key={review.reviewId} className="border-t border-coolgray-10 hover:bg-coolgray-10/50">
              <td className={BODY_CELL_CLASS}>
                <TruncatedCell text={review.placeName ?? '삭제된 장소'} />
              </td>
              <td className={BODY_CELL_CLASS}>★ {review.rating}</td>
              <td className={BODY_CELL_CLASS}>
                <TruncatedCell text={review.content} />
              </td>
              <td className={BODY_CELL_CLASS}>
                <span className={stateBadge(label)}>{label}</span>
              </td>
              <td className={BODY_CELL_CLASS}>{review.pendingReportCount}건</td>
              <td className={BODY_CELL_CLASS}>
                <AdminMemberCell member={review.author} onSelect={onSelectMember} />
              </td>
              <td className={BODY_CELL_CLASS}>{formatAdminDateTime(review.createdAt)}</td>
              <td className={BODY_CELL_CLASS}>
                {/* 작성자가 지운 리뷰는 화면에 나오지 않으므로 숨김을 바꾸지 않는다. */}
                {!review.deleted && (
                  <button
                    type="button"
                    disabled={visibility.isPending}
                    onClick={() =>
                      confirm({
                        ...reviewVisibilityConfirm(!hidden),
                        onConfirm: () => visibility.mutate({ reviewId: review.reviewId, hidden: !hidden }),
                      })
                    }
                    className={`${ROW_BUTTON_CLASS} ${
                      hidden
                        ? 'border-coolgray-30 text-coolgray-90 hover:border-primary-60'
                        : 'border-alert/40 text-alert hover:bg-alert/5'
                    }`}
                  >
                    {hidden ? '숨김 해제' : '숨기기'}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </ListTable>
    </ListSection>
  );
}

export function MemberListSection({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (memberId: number) => void;
}) {
  const [suspended, setSuspended] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const { data, isPending, isError } = useAdminMembers(keyword, page, suspended);

  return (
    <ListSection
      title="회원 목록"
      data={data}
      toolbar={
        <>
          <FilterChips
            label="회원 상태"
            value={suspended}
            options={[
              { value: false, label: '전체' },
              { value: true, label: '정지 중' },
            ]}
            onChange={(next) => {
              setSuspended(next);
              setPage(0);
            }}
          />
          <KeywordSearch
            label="회원 검색"
            placeholder="학번·이름·닉네임"
            onSearch={(next) => {
              setKeyword(next);
              setPage(0);
            }}
          />
        </>
      }
      onPage={setPage}
    >
      <ListTable
        columns={[
          { label: '회원', width: 'w-[64%]' },
          { label: '상태', width: 'w-[22%]' },
          { label: '받은 신고', width: 'w-[14%]' },
        ]}
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.items.length === 0}
        emptyText="조건에 맞는 회원이 없어요."
      >
        {data?.items.map(({ member, receivedReportCount }) => {
          const suspendedNow = isSuspendedNow(member);
          const label = suspendedNow ? '정지 중' : '정상';
          return (
            <tr
              key={member.memberId}
              aria-selected={selectedId === member.memberId}
              className={`border-t border-coolgray-10 ${
                selectedId === member.memberId ? 'bg-primary-30/70' : 'hover:bg-coolgray-10/50'
              }`}
            >
              <td className={BODY_CELL_CLASS}>
                <AdminMemberCell member={member} onSelect={onSelect} />
              </td>
              <td className={BODY_CELL_CLASS}>
                <span className={stateBadge(label)}>{label}</span>
              </td>
              <td className={BODY_CELL_CLASS}>{receivedReportCount}건</td>
            </tr>
          );
        })}
      </ListTable>
    </ListSection>
  );
}

function ListSection<T>({
  title,
  data,
  toolbar,
  onPage,
  children,
}: {
  title: string;
  data: TAdminPage<T> | undefined;
  toolbar: ReactNode;
  onPage: (page: number) => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-5 rounded-2xl border border-coolgray-10 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-heading-5 text-coolgray-90">{title}</h2>
          <p className="mt-1 text-body-s text-coolgray-60">조회 결과 {(data?.totalCount ?? 0).toLocaleString()}건</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
      </div>
      {children}
      {data && <PageControls page={data.page} size={data.size} totalCount={data.totalCount} onChange={onPage} />}
    </section>
  );
}

function ListTable({
  columns,
  isPending,
  isError,
  isEmpty,
  emptyText,
  children,
}: {
  // label이 빈 열은 행 동작 버튼 자리다.
  columns: { label: string; width: string }[];
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  const message = isPending ? '불러오는 중이에요' : isError ? '목록을 불러오지 못했어요.' : isEmpty ? emptyText : null;
  return (
    <div className="max-h-[640px] overflow-auto rounded-xl border border-coolgray-10">
      <table className="w-full min-w-[1080px] table-fixed border-collapse bg-white">
        <colgroup>
          {columns.map((column) => (
            <col key={column.label || 'actions'} className={column.width} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-primary-30">
          <tr>
            {columns.map((column) => (
              <th key={column.label || 'actions'} className={HEADER_CELL_CLASS}>
                {column.label ? column.label : <span className="sr-only">동작</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {message ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`px-4 py-16 text-center text-body-m ${isError ? 'text-alert' : 'text-coolgray-60'}`}
              >
                {message}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
