'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth.store';

export function useRequireAuth() {
  const router     = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !accessToken) {
      router.push('/login');
    }
  }, [isHydrated, accessToken, router]);

  return { user, isLoading: !isHydrated, isAuthenticated: !!accessToken };
}

export function useRedirectIfAuth() {
  const router = useRouter();
  const { accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && accessToken) {
      router.push('/');
    }
  }, [isHydrated, accessToken, router]);

  return { isLoading: !isHydrated };
}
