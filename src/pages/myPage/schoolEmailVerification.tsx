/** [마이페이지 > 학교 이메일 인증] 페이지 (/my-page/school-email-verification) */
import { useNavigate } from 'react-router-dom';

import Check from '@/assets/icons/check.svg?react';
import Inbox from '@/assets/icons/inbox.svg?react';
import Loading from '@/components/common/feedback/loading';
import Button from '@/components/common/inputs/button';
import TextField from '@/components/common/inputs/textField';
import SchoolEmailCodeForm from '@/components/myPage/schoolEmailCodeForm';
import useSchoolEmailVerification from '@/hooks/user/useSchoolEmailVerification';
import useSchoolEmailVerificationForm from '@/hooks/user/useSchoolEmailVerificationForm';
import NotFound from '@/pages/exception/notFound';
import { SCHOOL_EMAIL_DOMAIN } from '@/utils/user/schoolEmailVerification';

export default function SchoolEmailVerification() {
  const { data, isPending, isError } = useSchoolEmailVerification();
  if (isPending) return <Loading />;
  if (isError || !data) return <NotFound />;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 p-6 text-coolgray-90 lg:gap-12 lg:p-20">
      {/* PDF 본인 인증 회원도 학교 이메일을 별도로 인증할 수 있다. */}
      {data.schoolEmailVerified ? <VerificationComplete /> : <SchoolEmailForm />}
    </div>
  );
}

/** 인증 직후와 재조회 후에 같은 완료 화면을 표시한다. */
function VerificationComplete() {
  const navigate = useNavigate();
  return (
    <>
      <Check aria-hidden="true" className="h-10 w-10 shrink-0 lg:h-20 lg:w-20" />
      <div role="status" className="flex w-full flex-col items-center gap-3 text-center lg:gap-4">
        <h1 className="text-heading-4 lg:text-heading-2">인증 완료</h1>
        <p className="text-heading-6 lg:text-heading-4">학교 이메일 인증이 정상적으로 완료 되었어요.</p>
        <p className="whitespace-pre-line text-body-s text-coolgray-60 lg:text-body-l">
          {'이제 동그리의 다양한 서비스를 사용할 수 있어요.\n사용하다가 미흡한 점이 있으면 고객지원에 문의해주세요.'}
        </p>
      </div>
      <Button className="w-40 max-w-full" onClick={() => navigate('/my-page/profile')}>
        닫기
      </Button>
    </>
  );
}

/** 조회 완료 후 마운트해 인증된 회원에게 코드 입력 폼을 노출하지 않는다. */
function SchoolEmailForm() {
  const form = useSchoolEmailVerificationForm();
  if (form.isConfirmed) return <VerificationComplete />;

  return (
    <>
      <div className="flex flex-col items-center gap-8 lg:gap-12">
        <Inbox aria-hidden="true" className="h-10 w-10 shrink-0 lg:h-20 lg:w-20" />
        <h1 className="text-heading-4 text-center lg:text-heading-2">학교 이메일 인증</h1>
      </div>
      {form.requestedLocalPart ? (
        <SchoolEmailCodeForm form={form} />
      ) : (
        <div className="flex w-full max-w-80 flex-col gap-8">
          <p className="text-body-m text-center text-coolgray-90">
            학교 이메일의 아이디만 입력해주세요.
            <br />
            인증 코드는 {SCHOOL_EMAIL_DOMAIN} 주소로 발송돼요.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              form.requestCode();
            }}
            className="flex flex-col gap-10"
          >
            <div className="flex justify-center gap-2">
              <TextField
                id="school-email-id"
                className="min-w-0 flex-0.5"
                placeholder="이메일 아이디"
                value={form.localPart}
                onChange={(event) => form.changeLocalPart(event.target.value)}
                disabled={form.isBusy}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                maxLength={30}
                aria-describedby="school-email-domain"
                error={form.emailError}
              />
              <span id="school-email-domain" className="shrink-0 py-3 text-body-m text-coolgray-90">
                {SCHOOL_EMAIL_DOMAIN}
              </span>
            </div>

            <Button
              type="submit"
              className="w-40 max-w-full self-center"
              variant={form.isBusy || form.resendSeconds > 0 ? 'disabled' : 'primary'}
            >
              {form.isRequesting
                ? '인증 코드 발송 중'
                : form.resendSeconds > 0
                  ? `${form.resendSeconds}초 후 재발송 가능`
                  : '인증 코드 받기'}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
