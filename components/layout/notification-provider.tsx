'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Toast } from '@/components/ui/toast';

interface NotificationContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { addNotification } = useAppStore();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    addNotification({
      type: 'system',
      priority: type === 'error' ? 'high' : 'medium',
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
    });
  };

  const value = {
    showToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

function ToastContainer() {
  const { notifications } = useAppStore();
  
  // Get the 3 most recent unread notifications for toast display
  const recentNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3)
    .reverse(); // Show newest at top

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {recentNotifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}