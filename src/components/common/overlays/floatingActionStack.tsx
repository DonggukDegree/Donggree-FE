/**
 * [공용] 화면 오른쪽 아래 떠 있는 버튼 묶음
 * 맨 위로 가기 등 원형 버튼을 위에서 아래로 쌓는다. 오른쪽 끝은 관리자 화면 전환 버튼과 맞춘다.
 * 관리자 계정은 같은 자리에 화면 전환 버튼(AdminModeToggle)이 있으므로 그 위로 올려 겹치지 않게 한다.
 */
import type { ReactNode } from 'react';

import useCurrentRole from '@/hooks/auth/useCurrentRole';
import { isAdminRole } from '@/utils/auth/authRole';

const BASE_POSITION =
  'bottom-[calc(1rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]';
// 관리자 전환 버튼 높이(44px)와 간격(12px)만큼 위로.
const ABOVE_ADMIN_TOGGLE =
  'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(5rem+env(safe-area-inset-bottom))]';

export default function FloatingActionStack({ children }: { children: ReactNode }) {
  const role = useCurrentRole();
  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-center gap-3 lg:right-6 ${
        isAdminRole(role) ? ABOVE_ADMIN_TOGGLE : BASE_POSITION
      }`}
    >
      {children}
    </div>
  );
}
