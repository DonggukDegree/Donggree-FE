/** [학교 이메일 인증] 발송 후 인증 코드 입력·재발송 화면 */
import Button from '@/components/common/inputs/button';
import SchoolEmailCodeSlots from '@/components/myPage/schoolEmailCodeSlots';
import type useSchoolEmailVerificationForm from '@/hooks/user/useSchoolEmailVerificationForm';
import { formatRemainingTime, SCHOOL_EMAIL_DOMAIN } from '@/utils/user/schoolEmailVerification';

interface ISchoolEmailCodeFormProps {
  form: ReturnType<typeof useSchoolEmailVerificationForm>;
}

export default function SchoolEmailCodeForm({ form }: ISchoolEmailCodeFormProps) {
  const resendDisabled = form.isBusy || form.resendSeconds > 0;

  return (
    <div className="school-email-code-form flex w-full max-w-112 flex-col gap-8 text-center">
      <p className="break-all text-center text-body-m text-coolgray-90">
        {form.requestedLocalPart}
        {SCHOOL_EMAIL_DOMAIN}
        <br />
        메일로 받은 인증 코드를 입력해주세요.
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex w-[var(--code-slots-width)] max-w-full flex-none flex-col gap-3 text-left">
            <label htmlFor="school-email-code" className="text-body-m leading-6 text-coolgray-90">
              인증 코드
            </label>
            <SchoolEmailCodeSlots
              value={form.code}
              onChange={form.changeCode}
              disabled={form.isBusy || form.expirySeconds === 0 || form.isCodeLocked}
              error={form.codeError}
            />
            {/* 위 라벨과 안내 줄 높이를 맞춰 옆 버튼도 슬롯과 같은 높이에 배치한다. */}
            <p
              className={`h-6 text-body-s leading-6 ${form.expirySeconds > 0 || form.isDeliveryPending ? 'text-coolgray-60' : 'text-alert'}`}
            >
              남은 시간 {form.isDeliveryPending ? '--:--' : formatRemainingTime(form.expirySeconds)}
            </p>
          </div>
          <Button
            type="button"
            variant="outlined"
            className="h-[var(--code-input-height)] w-20 shrink-0 disabled:pointer-events-none disabled:border-coolgray-30 disabled:text-coolgray-30"
            disabled={resendDisabled}
            onClick={form.requestCode}
            aria-describedby={form.resendSeconds > 0 ? 'school-email-resend-wait' : undefined}
          >
            {form.isRequesting ? '발송 중' : '재발송'}
          </Button>
        </div>
        {form.codeError && (
          <p id="school-email-code-error" role="alert" className="text-body-s text-alert">
            {form.codeError}
          </p>
        )}
        {form.deliveryFailed && (
          <p role="alert" className="text-body-s text-alert">
            발송에 실패하였습니다. 다시 발송해주세요.
          </p>
        )}
        {form.expirySeconds === 0 && !form.codeError && !form.isDeliveryPending && !form.deliveryFailed && (
          <p className="text-body-s text-alert">인증 코드가 만료되었어요. 다시 발송해주세요.</p>
        )}
      </div>
    </div>
  );
}
