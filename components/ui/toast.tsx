'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';

interface ToastProps {
  notification: Notification;
}

export function Toast({ notification }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const { markNotificationAsRead } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      markNotificationAsRead(notification.id);
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <CheckCircle className="h-5 w-5" />;
      case 'delivery':
        return <Info className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'low':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = () => {
    switch (notification.priority) {
      case 'urgent':
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-blue-500';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div
      className={cn(
        'max-w-sm w-full border rounded-lg shadow-lg p-4 transition-all duration-300',
        getColors(),
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn('flex-shrink-0', getIconColor())}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              {notification.locationId && (
                <p className="text-xs mt-1 opacity-75">
                  Location: {notification.locationId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action button for actionable notifications */}
      {notification.actionUrl && (
        <div className="mt-3">
          <button
            onClick={() => {
              // Handle navigation to action URL
              window.location.href = notification.actionUrl!;
              handleClose();
            }}
            className="text-sm font-medium underline opacity-90 hover:opacity-100"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
}