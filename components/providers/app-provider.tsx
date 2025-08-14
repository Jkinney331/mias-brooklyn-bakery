'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationProvider } from '@/components/layout/notification-provider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}