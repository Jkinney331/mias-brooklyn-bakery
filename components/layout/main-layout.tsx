'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();
  const { startRealTimeUpdates, stopRealTimeUpdates } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [isAuthenticated, startRealTimeUpdates, stopRealTimeUpdates]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bakery-cream">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brooklyn-500"></div>
          <p className="text-gray-600">Loading Mia's Bakery...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bakery-cream">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-serif font-bold text-bakery-brown">
              Mia's Brooklyn Bakery
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Management System
            </p>
          </div>
          {/* Login form will be rendered here */}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bakery-cream flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-25"></div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform lg:hidden transition-transform duration-300 ease-in-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar 
          collapsed={false} 
          onToggle={() => setMobileMenuOpen(false)} 
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}