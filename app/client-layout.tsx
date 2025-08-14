'use client';

import { AppProvider } from '@/components/providers/app-provider';
import { MainLayout } from '@/components/layout/main-layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AppProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </AppProvider>
  );
}