import { useEffect } from 'react';

import { useModalStore } from '@/stores/modalStore';

export default function OnBoarding() {
  const { openOnboarding } = useModalStore();

  useEffect(() => {
    openOnboarding();
  }, [openOnboarding]);

  return <div className="flex-1 bg-white" />;
}
