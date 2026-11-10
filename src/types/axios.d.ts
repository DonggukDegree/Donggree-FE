import 'axios';

declare module 'axios' {
  // 외부 라이브러리의 인터페이스 이름을 유지해야 타입 보강이 적용된다.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface AxiosRequestConfig {
    /** 분석용 배경 인증 확인 실패는 화면 이동을 유발하지 않는다. */
    passiveAuth?: boolean;
  }
}
